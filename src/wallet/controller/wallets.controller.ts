import { Request, Response } from "express";
import debug from "debug";
import { nanoid } from "nanoid";
import WalletsService from "../services/wallets.service";
import PaystackService from "../services/paystack.service";
import { CreateWalletTransactionDto } from "../dtos/create.wallet.transaction.dto";
import {
  Wallet,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@prisma/client";
import { PatchWalletTransactionDto } from "../dtos/patch.wallet.transaction.dto";
import {
  PaystackInitResponse,
  PaystackVerifyResponse,
} from "../types/paystack.interface";
import { PermissionFlag } from "../../common/middleware/common.permissionFlag.enum";

const log = debug("app: wallet-controller");

class WalletController {
  async listTransactions(req: Request, res: Response) {
    const { limit = 10 } = req.query;
    const transactions = await WalletsService.list(Number(limit));
    return res.status(200).send({
      status: "success",
      message: "Transactions Retreived",
      transactions,
    });
  }

  async getTransactionById(req: Request, res: Response) {
    const transactionId = req.body.transactionId;
    const userWallet: Wallet = req.body.userWallet;
    const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags);
    let transaction: WalletTransaction | null;

    if (userPermissionFlags & PermissionFlag.ADMIN) {
      transaction = await WalletsService.readById(transactionId);
      if (!transaction) {
        return res.status(404).send({
          status: "failed",
          errors: [`Transaction with id ${transactionId} does not exist`],
        });
      }
    } else {
      transaction = await WalletsService.getTransactionByUserParticipation(
        userWallet.id,
        transactionId
      );
    }
    return res.status(200).send({
      status: "success",
      message: "Transaction Retrieved",
      transaction,
    });
  }

  async getWalletByUserId(req: Request, res: Response) {
    const userWallet = await WalletsService.getWalletByUserId(
      res.locals.jwt.userId
    );
    return res.status(200).send({
      status: "success",
      message: "User Wallet Retrieved",
      wallet: userWallet,
    });
  }

  async initWalletFunding(req: Request, res: Response) {
    req.body.email = res.locals.jwt.email;

    const paystack_response: PaystackInitResponse | undefined =
      await PaystackService.initializePayment(req.body);

    if (!paystack_response) {
      return res.status(500).send({
        status: "failed",
        message: "error occured, could not initialize wallet funding",
      });
    }

    const creditWallet: Wallet = req.body.userWallet;

    const newTransactionBody: CreateWalletTransactionDto = {
      amount: req.body.amount,
      ref: paystack_response.data.reference,
      type: WalletTransactionType.WalletFunding,
      status: WalletTransactionStatus.PENDING,
      creditWalletId: creditWallet.id,
      prevCreditWalletBalance: creditWallet.balance,
      newCreditWalletBalance: creditWallet.balance + req.body.amount,
    };

    const newTransaction = await WalletsService.create(newTransactionBody);

    return res.status(201).send({
      status: "success",
      message:
        "Initialized Wallet Funding, please check out paystack link to confirm",
      newTransaction,
      ref: paystack_response.data.reference,
      paystack_authorization_url: paystack_response.data.authorization_url,
    });
  }

  async transferFunds(req: Request, res: Response) {
    const creditWallet: Wallet = req.body.recipientWallet;
    const debitWallet: Wallet = req.body.userWallet;
    const amount: number = parseInt(req.body.amount);

    const newTransactionBody: CreateWalletTransactionDto = {
      amount: amount,
      ref: nanoid(10),
      type: WalletTransactionType.WalletToWallet,
      narration: req.body.narration,
      status: WalletTransactionStatus.SUCCESS,
      creditWalletId: creditWallet.id,
      debitWalletId: debitWallet.id,
      prevDebitWalletBalance: debitWallet.balance,
      prevCreditWalletBalance: creditWallet.balance,
      newDebitWalletBalance: debitWallet.balance - amount,
      newCreditWalletBalance: creditWallet.balance + amount,
    };

    const newTransaction = await WalletsService.create(newTransactionBody);

    if (
      newTransaction &&
      typeof newTransaction.new_credit_wallet_balance === "number" &&
      typeof newTransaction.new_debit_wallet_balance === "number"
    ) {
      await WalletsService.updateWalletByWalletId(creditWallet.id, {
        newBalance: newTransaction.new_credit_wallet_balance,
      });

      await WalletsService.updateWalletByWalletId(debitWallet.id, {
        newBalance: newTransaction.new_debit_wallet_balance,
      });
    }

    return res.status(201).send({
      status: "success",
      message: "Transfer Successful",
      newTransaction,
    });
  }

  async updateTransaction(req: Request, res: Response) {
    const creditWallet: Wallet = req.body.userWallet;
    const transaction: WalletTransaction = req.body.transaction;
    const paystack_ref: string = req.body.reference;
    const paystack_response: PaystackVerifyResponse | undefined =
      await PaystackService.verifyPayment(paystack_ref);

    if (!paystack_response || paystack_response.data.status !== "success") {
      return res.status(500).send({
        status: "failed",
        errors: ["error occured funding the wallet"],
      });
    }
    const updateTransactionBody: PatchWalletTransactionDto = {
      status: WalletTransactionStatus.SUCCESS,
      creditWalletId: creditWallet.id,
      prevCreditWalletBalance: creditWallet.balance,
      newCreditWalletBalance:
        creditWallet.balance + paystack_response.data.amount,
    };

    const updatedTransaction = await WalletsService.patchById(
      transaction.id,
      updateTransactionBody
    );

    return res.status(200).send({
      status: "success",
      message: "Wallet Funded",
      transaction: updatedTransaction,
    });
  }
}

export default new WalletController();
