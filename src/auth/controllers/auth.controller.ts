import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import debug from "debug";

const log = debug("app:auth-controller");
const jwtSecret = process.env.JWT_SECRET as string;
const tokenExpirationInSeconds = 36000;

class AuthController {
  async createJWT(req: Request, res: Response) {
    try {
      const refreshId = req.body.userId + jwtSecret;
      const salt = crypto.createSecretKey(crypto.randomBytes(16));
      const hash = crypto
        .createHmac("sha512", salt)
        .update(refreshId)
        .digest("base64");

      req.body.refreshKey = salt.export();

      const token = jwt.sign(req.body, jwtSecret, {
        expiresIn: tokenExpirationInSeconds,
      });

      return res
        .status(201)
        .send({ status: "success", accessToken: token, refreshToken: hash });
    } catch (err) {
      log(err);
      return res
        .status(500)
        .send({ status: "failed", errors: ["Internal Server error"] });
    }
  }

  async logUserOut(req: Request, res: Response) {
    try {
      jwt.sign(req.body, jwtSecret, {
        expiresIn: 0,
      });
      return res
        .status(200)
        .send({ status: "success", message: "User logged out successfully" });
    } catch (err) {
      log(err);
      return res.status(500).send({ status: "failed", error: "JWT error" });
    }
  }
}
export default new AuthController();
