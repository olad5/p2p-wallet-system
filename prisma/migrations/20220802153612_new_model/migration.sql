/*
  Warnings:

  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `firstName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `lastName` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `narration` on the `WalletTransaction` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "WalletTransaction" ALTER COLUMN "narration" SET DATA TYPE VARCHAR(100);
