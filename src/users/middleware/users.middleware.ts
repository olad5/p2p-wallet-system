import UsersService from "../../users/services/users.service";
import { Response, Request, NextFunction } from "express";

class UsersMiddleware {
  async validateSameEmailDoesntExist(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const user = await UsersService.getUserByEmail(req.body.email);
    if (user) {
      res
        .status(400)
        .send({ status: "failed", errors: ["User email already exists"] });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (res.locals.user._id === req.params.userId) {
      next();
    } else {
      res.status(400).send({ status: "failed", errors: ["Invalid email"] });
    }
  }

  async userCantChangePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (
      "permissionFlags" in req.body &&
      req.body.permissionFlags !== res.locals.user.permissionFlags
    ) {
      res.status(400).send({
        status: "failed",
        errors: ["User cannot change permission flags"],
      });
    } else {
      next();
    }
  }

  async validatePatchEmail(req: Request, res: Response, next: NextFunction) {
    if (req.body.email) {
      this.validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  }

  async validateUserExists(req: Request, res: Response, next: NextFunction) {
    const user = await UsersService.readById(req.params.userId);
    if (user) {
      res.locals.user = user;
      next();
    } else {
      res.status(404).send({
        status: "failed",
        errors: [`User ${req.params.userId} not found`],
      });
    }
  }

  async extractUserId(req: Request, res: Response, next: NextFunction) {
    req.body.id = req.params.userId;
    next();
  }
}

export default new UsersMiddleware();
