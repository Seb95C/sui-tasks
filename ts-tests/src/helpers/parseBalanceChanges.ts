import { BalanceChange } from "@mysten/sui/client";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";

interface Args {
  balanceChanges: BalanceChange[];
  senderAddress: string;
  recipientAddress: string;
}

interface Response {
  recipientSUIBalanceChange: number;
  senderSUIBalanceChange: number;
}

/**
 * Parses the balance changes as they are returned by the SDK.
 * Filters out and formats the ones that correspond to SUI tokens and to the defined sender and recipient addresses.
 */
export const parseBalanceChanges = ({
  balanceChanges,
  senderAddress,
  recipientAddress,
}: Args): Response => {
  let recipientSUIBalanceChange = 0;
  let senderSUIBalanceChange = 0;

  for (const balanceChange of balanceChanges) {
    if (balanceChange.coinType !== SUI_TYPE_ARG) {
      // SUI_TYPE_ARG = ''0x2::sui::SUI'
      continue;
    }

    // Check if owner is an AddressOwner (not ObjectOwner, Shared, or Immutable)
    if (
      typeof balanceChange.owner === "object" &&
      "AddressOwner" in balanceChange.owner
    ) {
      const ownerAddress = balanceChange.owner.AddressOwner;
      const amount = parseInt(balanceChange.amount);
      if (ownerAddress === recipientAddress) {
        recipientSUIBalanceChange += amount;
      } else if (ownerAddress === senderAddress) {
        senderSUIBalanceChange += amount;
      }
    }
  }

  return {
    recipientSUIBalanceChange,
    senderSUIBalanceChange,
  };
};
