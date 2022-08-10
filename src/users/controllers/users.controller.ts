import { Request, Response } from "express";
import UsersService from "../services/users.service";
import * as argon2 from "argon2";

class UserController {
  async listUsers(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const users = await UsersService.list(Number(limit));
    return res.status(200).send({
      status: "success",
      message: "Users Retreived",
      users,
    });
  }

  async getUserById(req: Request, res: Response) {
    const user = await UsersService.readById(req.body.id);
    return res.status(200).send({
      status: "success",
      message: "User",
      user,
    });
  }
  async createUser(req: Request, res: Response) {
    req.body.password = await argon2.hash(req.body.password);
    const userId = await UsersService.create(req.body);
    return res.status(200).send({
      status: "success",
      message: "User Account Created",
      userId,
    });
  }
  async updateUser(req: Request, res: Response) {
    if (req.body.password) {
      req.body.password = await argon2.hash(req.body.password);
    }

    const updatedUser = await UsersService.patchById(req.body.id, req.body);
    return res.status(200).send({
      status: "success",
      message: "User Account Updated ",
      user: updatedUser,
    });
  }

  async removeUser(req: Request, res: Response) {
    await UsersService.deleteById(req.body.id);
    return res.status(204).send();
  }
}

export default new UserController();
