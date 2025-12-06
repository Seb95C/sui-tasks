import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { suiClient } from "../suiClient";
import { getSigner } from "./getSigner";

interface RegisterUsernameArgs {
  registryObjectId: string;
  username: string;
  senderSecretKey: string;
  packageId: string;
}

interface CreateProjectArgs {
  registryObjectId: string;
  name: string;
  description: string;
  managerDisplayName: string;
  clockObjectId: string;
  senderSecretKey: string;
  packageId: string;
}

interface AddMemberArgs {
  projectId: string;
  managerCapId: string;
  registryObjectId: string;
  memberAddress: string;
  displayName: string;
  clockObjectId: string;
  senderSecretKey: string;
  packageId: string;
}

interface AddTaskArgs {
  projectId: string;
  managerCapId: string;
  name: string;
  description: string;
  assigneeAddress: string;
  state: number;
  dueDate: number;
  senderSecretKey: string;
  packageId: string;
}

export const registerUsername = async ({
  registryObjectId,
  username,
  senderSecretKey,
  packageId,
}: RegisterUsernameArgs): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::username_registry::register_username`,
    arguments: [tx.object(registryObjectId), tx.pure.string(username)],
  });

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });
};

export const createProject = async ({
  registryObjectId,
  name,
  description,
  managerDisplayName,
  clockObjectId,
  senderSecretKey,
  packageId,
}: CreateProjectArgs): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::project::mint_project`,
    arguments: [
      tx.object(registryObjectId),
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.string(managerDisplayName),
      tx.object(clockObjectId),
    ],
  });

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });
};

export const addMember = async ({
  projectId,
  managerCapId,
  registryObjectId,
  memberAddress,
  displayName,
  clockObjectId,
  senderSecretKey,
  packageId,
}: AddMemberArgs): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::project::add_member`,
    arguments: [
      tx.object(managerCapId),
      tx.object(registryObjectId),
      tx.object(projectId),
      tx.pure.address(memberAddress),
      tx.pure.string(displayName),
      tx.object(clockObjectId),
    ],
  });

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });
};

export const addTask = async ({
  projectId,
  managerCapId,
  name,
  description,
  assigneeAddress,
  state,
  dueDate,
  senderSecretKey,
  packageId,
}: AddTaskArgs): Promise<SuiTransactionBlockResponse> => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::project::add_task`,
    arguments: [
      tx.object(managerCapId),
      tx.object(projectId),
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.address(assigneeAddress),
      tx.pure.u8(state),
      tx.pure.u64(dueDate),
    ],
  });

  return suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: getSigner({ secretKey: senderSecretKey }),
    options: {
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
    },
  });
};
