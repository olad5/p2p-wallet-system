/*
  Warnings:

  - Added the required column `ref` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "ref" VARCHAR(100) NOT NULL;
