import express from "express";
import { body } from "express-validator";
import jwtMiddleware from "../auth/middleware/jwt.middleware";
import { CommonRoutesConfig } from "../common/common.routes.config";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import commonPermissionMiddleware from "../common/middleware/common.permission.middleware";
import { PermissionFlag } from "../common/middleware/common.permissionFlag.enum";
import WalletsController from "./controller/wallets.controller";
import WalletsMiddleware from "./middleware/wallets.middleware";

export class WalletRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "WalletRoutes");
  }

  configureRoutes(): express.Application {
    this.app
      .route("/fund/")
      .post(
        body("reference").isLength({ min: 5 }),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        jwtMiddleware.validJWTNeeded,
        WalletsMiddleware.extractUserWalletDetails,
        WalletsMiddleware.extractTransactionDetails,
        WalletsMiddleware.verifyWalletFundingHasNotOccurred,
        WalletsController.updateTransaction
      );

    this.app
      .route("/fund/initialize")
      .post(
        body("amount")
          .isNumeric()
          .isLength({ min: 1 })
          .withMessage("Must include a valid integer "),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        jwtMiddleware.validJWTNeeded,
        WalletsMiddleware.extractUserWalletDetails,
        WalletsController.initWalletFunding
      );

    this.app
      .route("/transaction/transfer")
      .post(
        body("amount")
          .isNumeric()
          .isLength({ min: 1 })
          .withMessage("Must include a valid integer "),
        body("narration").isString().optional(),
        body("recipientUserId")
          .isString()
          .isLength({ min: 1 })
          .withMessage("Must include a valid string "),
        BodyValidationMiddleware.verifyBodyFieldsErrors,
        jwtMiddleware.validJWTNeeded,
        WalletsMiddleware.userCantTransferFundsToTheirOwnWallet,
        WalletsMiddleware.extractUserWalletDetails,
        WalletsMiddleware.extractRecipentWalletDetails,
        WalletsMiddleware.verifyUserHasEnoughFundsInWallet,
        WalletsController.transferFunds
      );

    this.app
      .route("/wallet/:userId")
      .get(
        jwtMiddleware.validJWTNeeded,
        commonPermissionMiddleware.onlySameUserOrAdminCanDoThisAction,
        WalletsController.getWalletByUserId
      );

    this.app
      .route("/transactions")
      .get(
        jwtMiddleware.validJWTNeeded,
        commonPermissionMiddleware.permissionFlagRequired(PermissionFlag.ADMIN),
        WalletsController.listTransactions
      );

    this.app
      .route(`/transactions/:transactionId`)
      .get(
        jwtMiddleware.validJWTNeeded,
        WalletsMiddleware.extractUserWalletDetails,
        WalletsMiddleware.verifyUserHasThisTransaction,
        WalletsController.getTransactionById
      );

    return this.app;
  }
}
