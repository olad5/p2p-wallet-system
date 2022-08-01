import { Application } from "express";
import { body } from "express-validator";
import { CommonRoutesConfig } from "../common/common.routes.config";
import bodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import authMiddleware from "./middleware/auth.middleware";
import jwtMiddleware from "./middleware/jwt.middleware";

import authController from "./controllers/auth.controller";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: Application) {
    super(app, "AuthRoutes");
  }

  configureRoutes(): Application {
    this.app.post("/login", [
      body("email").isEmail(),
      body("password").isString(),
      bodyValidationMiddleware.verifyBodyFieldsErrors,
      authMiddleware.verifyUserPassword,
      authController.createJWT,
    ]);

    this.app.get(`/logout`, [
      jwtMiddleware.validJWTNeeded,
      authController.logUserOut,
    ]);

    this.app.post(`/auth/refresh-token`, [
      jwtMiddleware.validJWTNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJWT,
    ]);

    return this.app;
  }
}
