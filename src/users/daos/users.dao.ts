import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import PrismaService from "../../common/services/prisma.service";
import debug from "debug";
import { PermissionFlag } from "../../common/middleware/common.permissionFlag.enum";

const log = debug("app:UsersDaos");

class UsersDaos {
  private prismaClient = this.prismaService.getPrismaClient();

  constructor(private prismaService: typeof PrismaService) {
    log("Creatde new Instance of UserDaos");
  }

  async addUser(userFields: CreateUserDto) {
    const newUser = await this.prismaClient.user.create({
      data: {
        email: userFields.email,
        password: userFields.password,
        firstName: userFields.firstName,
        lastName: userFields.lastName,
        permissionFlags: PermissionFlag.USER,
      },
    });

    await this.prismaClient.wallet.create({
      data: {
        user_id: newUser.id,
      },
    });
    return newUser.id;
  }

  async getUserById(userId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } else {
      return null;
    }
  }

  async getUsers(limit: number) {
    const users = await this.prismaClient.user.findMany({
      take: limit,
    });

    return users;
  }

  async getUserByEmail(userEmail: string) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    return user;
  }

  async getUserByEmailWithPassword(userEmail: string) {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        email: true,
        id: true,
        password: true,
        permissionFlags: true,
      },
    });
    return user;
  }

  async updateUserById(userId: string, userFields: PatchUserDto) {
    const existingUser = await this.prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        ...userFields,
      },
    });
    const { password, ...userWithoutPassword } = existingUser;
    return userWithoutPassword;
  }

  async removeUserById(userId: string) {
    const deletedUser = await this.prismaClient.user.delete({
      where: {
        id: userId,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return deletedUser;
  }
}

export default new UsersDaos(PrismaService);
