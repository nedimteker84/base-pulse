import { createPublicClient, http, type Address } from "viem";
import { configuredChain, configuredRpcUrl } from "./chains";

const baseClient = createPublicClient({
  chain: configuredChain,
  transport: http(configuredRpcUrl),
});

const knownContracts: Record<string, { name: string; action: string }> = {
  "0x4200000000000000000000000000000000000006": {
    name: "Wrapped Ether",
    action: "Deposits, withdrawals, and transfers",
  },
  "0x4200000000000000000000000000000000000010": {
    name: "Base Bridge",
    action: "Bridge deposits and withdrawals",
  },
  "0x000000000022d473030f116ddee9f6b43ac78ba3": {
    name: "Permit2",
    action: "Token approvals and permissions",
  },
};

function shortenAddress(address: Address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getActivityStatus(count: number) {
  if (count >= 10) return "Surging";
  if (count >= 5) return "High activity";
  if (count >= 2) return "Rising";
  return "Active";
}

export async function getTrendingContractInteractions() {
  const latestBlockNumber = await baseClient.getBlockNumber();
  const blockNumbers = Array.from({ length: 5 }, (_, index) =>
    latestBlockNumber - BigInt(index),
  );

  const blocks = await Promise.all(
    blockNumbers.map((blockNumber) =>
      baseClient.getBlock({ blockNumber, includeTransactions: true }),
    ),
  );

  const interactions = new Map<
    Address,
    { count: number; latestBlock: bigint; totalValueWei: bigint }
  >();

  for (const block of blocks) {
    for (const transaction of block.transactions) {
      if (!transaction.to) continue;

      const existing = interactions.get(transaction.to) ?? {
        count: 0,
        latestBlock: block.number,
        totalValueWei: BigInt(0),
      };

      interactions.set(transaction.to, {
        count: existing.count + 1,
        latestBlock:
          block.number > existing.latestBlock ? block.number : existing.latestBlock,
        totalValueWei: existing.totalValueWei + transaction.value,
      });
    }
  }

  return [...interactions.entries()]
    .sort(([, left], [, right]) => right.count - left.count)
    .slice(0, 5)
    .map(([address, interaction]) => {
      const knownContract = knownContracts[address.toLowerCase()];

      return {
        name: knownContract?.name ?? "Active contract",
        action: knownContract?.action ?? "Recent contract calls",
        status: getActivityStatus(interaction.count),
        address,
        shortAddress: shortenAddress(address),
        interactionCount: interaction.count,
        latestBlock: interaction.latestBlock.toString(),
        totalValueWei: interaction.totalValueWei.toString(),
      };
    });
}