import debug from "debug";
import PrismaService from "../../common/services/prisma.service";
import { CreateWalletTransactionDto } from "../dtos/create.wallet.transaction.dto";
import { PatchWalletTransactionDto } from "../dtos/patch.wallet.transaction.dto";
import { PatchWalletDto } from "../dtos/patch.wallet.dto";

const log = debug("app:Wallets-Daos");

class WalletsDaos {
  private prismaClient = this.prismaService.getPrismaClient();

  constructor(private prismaService: typeof PrismaService) {
    log("Creatde new Instance of WalletsDaos");
  }

  async createTransaction(transactionFields: CreateWalletTransactionDto) {
    const newTransaction = await this.prismaClient.walletTransaction.create({
      data: {
        amount: transactionFields.amount,
        ref: transactionFields.ref,
        narration: transactionFields.narration,
        type: transactionFields.type,
        status: transactionFields.status,
        credit_wallet_id: transactionFields.creditWalletId,
        debit_wallet_id: transactionFields.debitWalletId,
        prev_debit_wallet_balance: transactionFields.prevDebitWalletBalance,
        new_debit_wallet_balance: transactionFields.newDebitWalletBalance,
        prev_credit_wallet_balance: transactionFields.prevCreditWalletBalance,
        new_credit_wallet_balance: transactionFields.newCreditWalletBalance,
      },
    });

    return newTransaction;
  }

  async getTransactionById(transactionId: string) {
    const transaction = await this.prismaClient.walletTransaction.findUnique({
      where: {
        id: transactionId,
      },
    });
    return transaction;
  }

  async getTransactionByUserParticipation(
    userWalletId: string,
    transactionId: string
  ) {
    const transaction = await this.prismaClient.walletTransaction.findFirst({
      where: {
        OR: [
          { id: transactionId, credit_wallet_id: userWalletId },
          { id: transactionId, debit_wallet_id: userWalletId },
        ],
      },
    });
    return transaction;
  }

  async getTransactionByReference(reference: string) {
    const transaction = await this.prismaClient.walletTransaction.findFirst({
      where: {
        ref: reference,
      },
    });
    return transaction;
  }

  async getTransactions(limit: number) {
    const transactions = await this.prismaClient.walletTransaction.findMany({
      take: limit,
    });

    return transactions;
  }

  async getWalletByUserId(userId: string) {
    const wallet = await this.prismaClient.wallet.findUnique({
      where: {
        user_id: userId,
      },
    });
    return wallet;
  }

  async updateWalletByWalletId(walletId: string, walletFields: PatchWalletDto) {
    const wallet = await this.prismaClient.wallet.update({
      where: {
        id: walletId,
      },
      data: {
        balance: walletFields.newBalance,
      },
    });

    return wallet;
  }

  async updateTransactionById(
    transactionId: string,
    transactionFields: PatchWalletTransactionDto
  ) {
    const updatedTransaction = await this.prismaClient.walletTransaction.update(
      {
        where: {
          id: transactionId,
        },
        data: {
          status: transactionFields.status,
          credit_wallet_id: transactionFields.creditWalletId,
          prev_credit_wallet_balance: transactionFields.prevCreditWalletBalance,
          new_credit_wallet_balance: transactionFields.newCreditWalletBalance,
        },
      }
    );

    await this.prismaClient.wallet.update({
      where: {
        id: transactionFields.creditWalletId,
      },

      data: {
        balance: transactionFields.newCreditWalletBalance,
      },
    });

    return updatedTransaction;
  }
}
export default new WalletsDaos(PrismaService);
