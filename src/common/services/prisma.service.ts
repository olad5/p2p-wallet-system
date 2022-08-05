import { PrismaClient } from "@prisma/client";
import debug from "debug";

const log = debug("app:prisma-service");

class PrismaService {
  private client = new PrismaClient();
  constructor() {
    log("DataBase connected successfully!");
  }

  public getPrismaClient() {
    return this.client;
  }
}

export default new PrismaService();
