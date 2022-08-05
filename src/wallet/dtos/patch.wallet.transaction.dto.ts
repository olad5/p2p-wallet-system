import { CreateWalletTransactionDto } from "./create.wallet.transaction.dto";

export interface PatchWalletTransactionDto
  extends Partial<CreateWalletTransactionDto> {}
