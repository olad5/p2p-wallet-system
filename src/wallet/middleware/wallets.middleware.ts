import { Response, Request, NextFunction } from "express";
import debug from "debug";
import WalletsService from "../services/wallets.service";
import { PermissionFlag } from "../../common/middleware/common.permissionFlag.enum";
import { Wallet } from "@prisma/client";

const log = debug("app:wallets-middleware");

class WalletsMiddleware {
  async extractUserWalletDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userWallet = await WalletsService.getWalletByUserId(
      res.locals.jwt.userId
    );
    if (userWallet) {
      req.body.userWallet = userWallet;
      next();
    } else {
      res
        .status(404)
        .send({ status: "failed", errors: ["User Wallet does not Exist"] });
    }
  }
  async extractRecipentWalletDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const recipientWallet = await WalletsService.getWalletByUserId(
      req.body.recipientUserId
    );
    if (recipientWallet) {
      req.body.recipientWallet = recipientWallet;
      next();
    } else {
      res.status(404).send({
        status: "failed",
        errors: ["Recipient Wallet does not Exist"],
      });
    }
  }

  async extractTransactionDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const transaction = await WalletsService.getTransactionByReferenceId(
      req.body.reference
    );
    if (transaction) {
      req.body.transaction = transaction;
      next();
    } else {
      res.status(404).send({
        status: "failed",
        errors: [`Transaction with ref ${req.body.reference} does not exist`],
      });
    }
  }

  async verifyWalletFundingHasNotOccurred(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const transaction = await WalletsService.readById(req.body.transaction.id);
    if (transaction && transaction.status === "PENDING") {
      next();
    } else {
      res
        .status(400)
        .send({ status: "failed", errors: ["Invalid Transaction action"] });
    }
  }

  async verifyUserHasThisTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    req.body.transactionId = req.params.transactionId;
    const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags);
    const transaction = await WalletsService.getTransactionByUserParticipation(
      req.body.userWallet.id,
      req.body.transactionId
    );
    if (transaction || userPermissionFlags & PermissionFlag.ADMIN) {
      next();
    } else {
      res.status(404).send({
        status: "failed",
        errors: [
          `Transaction with id ${req.params.transactionId} does not exist`,
        ],
      });
    }
  }
  async verifyUserHasEnoughFundsInWallet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const amount: number = req.body.amount;
    const userWallet: Wallet = req.body.userWallet;
    if (userWallet.balance >= amount) {
      next();
    } else {
      res.status(400).send({
        status: "failed",
        errors: [`Insufficient Funds`],
      });
    }
  }
  async userCantTransferFundsToTheirOwnWallet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.body.recipientUserId !== res.locals.jwt.userId) {
      next();
    } else {
      res.status(400).send({
        status: "failed",
        errors: [`User can't Transfer funds to their own wallet`],
      });
    }
  }
}
export default new WalletsMiddleware();
