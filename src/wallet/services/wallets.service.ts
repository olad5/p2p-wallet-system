import { CRUD } from "../../common/interfaces/crud.interface";
import { CreateWalletTransactionDto } from "../dtos/create.wallet.transaction.dto";
import { PatchWalletTransactionDto } from "../dtos/patch.wallet.transaction.dto";
import WalletsDaos from "../daos/wallets.daos";
import { WalletTransaction } from "@prisma/client";
import debug from "debug";
import { PatchWalletDto } from "../dtos/patch.wallet.dto";

const log = debug("app:Wallet-service");

class WalletService
  implements
    CRUD<
      WalletTransaction,
      CreateWalletTransactionDto,
      PatchWalletTransactionDto
    >
{
  async list(limit: number) {
    const transactions = await WalletsDaos.getTransactions(limit);
    return transactions;
  }

  async create(resource: CreateWalletTransactionDto) {
    const newTransaction = await WalletsDaos.createTransaction(resource);
    return newTransaction;
  }

  async readById(id: string) {
    const transaction = await WalletsDaos.getTransactionById(id);
    return transaction;
  }

  async updateWalletByWalletId(walletId: string, walletFields: PatchWalletDto) {
    const updatedWallet = await WalletsDaos.updateWalletByWalletId(
      walletId,
      walletFields
    );
    return updatedWallet;
  }

  async patchById(transactionId: string, resource: PatchWalletTransactionDto) {
    const updatedTransaction = await WalletsDaos.updateTransactionById(
      transactionId,
      resource
    );
    return updatedTransaction;
  }

  async getTransactionByReferenceId(referenceId: string) {
    const wallet = await WalletsDaos.getTransactionByReference(referenceId);
    return wallet;
  }

  async getWalletByUserId(userId: string) {
    const wallet = await WalletsDaos.getWalletByUserId(userId);
    return wallet;
  }

  async getTransactionByUserParticipation(
    userWalletId: string,
    transactionId: string
  ) {
    const wallet = await WalletsDaos.getTransactionByUserParticipation(
      userWalletId,
      transactionId
    );
    return wallet;
  }
}

export default new WalletService();
