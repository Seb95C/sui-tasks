import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "../suiClient";
import { getSigner } from "./getSigner";

interface Args {
  amount: number;
  senderSecretKey: string;
  recipientAddress: string;
}

/**
 * Transfers the specified amount of SUI from the sender secret key to the recipient address.
 * Returns the transaction response, as it is returned by the SDK.
 */
export const transferSUI = async ({
  amount,
  senderSecretKey,
  recipientAddress,
}: Args): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();

  const coin = tx.splitCoins(tx.gas, [amount]); // tx.gas will merge all of our Sui the address of transaction has, the split coin method will separate an object Sui coin with the amount from the total this tx.gas() only works for Sui native coin
  tx.transferObjects([coin], recipientAddress);

  // TODO: Add the commands to the transaction

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    options: {
      showEffects: true,
      showBalanceChanges: true,
    },
  });
};
