import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import UsersDao from "../daos/users.dao";
import { User } from "@prisma/client";

class UserService implements CRUD<Partial<User>, CreateUserDto, PatchUserDto> {
  async list(limit: number) {
    const users = await UsersDao.getUsers(limit);
    return users;
  }

  async create(resource: CreateUserDto) {
    const newUser = await UsersDao.addUser(resource);
    return newUser;
  }

  async readById(id: string) {
    const user = await UsersDao.getUserById(id);
    return user;
  }

  async patchById(id: string, resource: PatchUserDto) {
    const updatedUser = await UsersDao.updateUserById(id, resource);
    return updatedUser;
  }

  async deleteById(id: string) {
    const deletedUser = await UsersDao.removeUserById(id);
    return deletedUser;
  }

  async getUserByEmail(email: string) {
    const user = await UsersDao.getUserByEmail(email);
    return user;
  }
  async getUserByEmailWithPassword(email: string) {
    const user = UsersDao.getUserByEmailWithPassword(email);
    return user;
  }
}

export default new UserService();
