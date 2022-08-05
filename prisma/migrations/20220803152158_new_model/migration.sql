-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_debit_wallet_id_fkey";

-- AlterTable
ALTER TABLE "WalletTransaction" ALTER COLUMN "debit_wallet_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_debit_wallet_id_fkey" FOREIGN KEY ("debit_wallet_id") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
