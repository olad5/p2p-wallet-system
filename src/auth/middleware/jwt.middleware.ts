import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import usersService from "../../users/services/users.service";
import { Jwt } from "../../common/types/jwt";
import debug from "debug";

const log = debug("app:jwt-middleware");
const jwtSecret = process.env.JWT_SECRET as string;

class JwtMiddleware {
  verifyRefreshBodyField(req: Request, res: Response, next: NextFunction) {
    if (req.body && req.body.refreshToken) {
      return next();
    } else {
      return res
        .status(400)
        .send({ errors: ["Missing required field: refreshToken"] });
    }
  }
  async validRefreshNeeded(req: Request, res: Response, next: NextFunction) {
    const user = await usersService.getUserByEmailWithPassword(
      res.locals.jwt.email
    );
    const salt = crypto.createSecretKey(
      Buffer.from(res.locals.jwt.refreshKey.data)
    );
    const hash = crypto
      .createHmac("sha512", salt)
      .update(res.locals.jwt.userId + jwtSecret)
      .digest("base64");
    if (hash === req.body.refreshToken) {
      req.body = {
        userId: user?.id,
        email: user?.email,
        permissionFlags: user?.permissionFlags,
      };
      return next();
    } else {
      return res.status(400).send({ errors: ["Invalid refresh token"] });
    }
  }

  validJWTNeeded(req: Request, res: Response, next: NextFunction) {
    if (req.headers["authorization"]) {
      try {
        const authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send({
            status: "failed",
            error: "Unauthorized to access this route",
          });
        } else {
          res.locals.jwt = jwt.verify(authorization[1], jwtSecret) as Jwt;
          next();
        }
      } catch (err) {
        log(err);
        return res.status(403).send({
          status: "failed",
          error: "Unauthorized to access this route",
        });
      }
    } else {
      return res.status(401).send({
        status: "failed",
        error: "Unauthorized to access this route",
      });
    }
  }
}

export default new JwtMiddleware();
