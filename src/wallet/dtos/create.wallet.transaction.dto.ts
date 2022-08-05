import { WalletTransactionStatus, WalletTransactionType } from "@prisma/client";

export interface CreateWalletTransactionDto {
  amount: number;
  ref: string;
  narration?: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  creditWalletId: string;
  debitWalletId?: string;
  prevDebitWalletBalance?: number;
  newDebitWalletBalance?: number;
  prevCreditWalletBalance: number;
  newCreditWalletBalance: number;
}
