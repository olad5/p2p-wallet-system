import { Response, Request, NextFunction } from "express";
import * as argon2 from "argon2";
import UsersService from "../../users/services/users.service";
import debug from "debug";
const log = debug("app:auth-middleware");

class AuthMiddleware {
  async verifyUserPassword(req: Request, res: Response, next: NextFunction) {
    const user = await UsersService.getUserByEmailWithPassword(req.body.email);
    if (user) {
      const passwordHash = user.password;
      if (await argon2.verify(passwordHash, req.body.password)) {
        req.body = {
          userId: user.id,
          email: user.email,
          permissionFlags: user.permissionFlags,
        };
        return next();
      }
    }
    return res
      .status(400)
      .send({ status: "failed", errors: ["Invalid email and/or password"] });
  }
}

export default new AuthMiddleware();
