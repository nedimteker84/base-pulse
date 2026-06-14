import { createPublicClient, formatGwei, http } from "viem";
import { base } from "viem/chains";

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

function serializeGasValue(value: bigint) {
  return {
    wei: value.toString(),
    gwei: formatGwei(value),
  };
}

export async function getBaseGasSnapshot() {
  const [blockNumber, gasPrice, feesPerGas] = await Promise.all([
    baseClient.getBlockNumber(),
    baseClient.getGasPrice(),
    baseClient.estimateFeesPerGas(),
  ]);

  return {
    chainId: base.id,
    chainName: base.name,
    blockNumber: blockNumber.toString(),
    gasPrice: serializeGasValue(gasPrice),
    maxFeePerGas: serializeGasValue(feesPerGas.maxFeePerGas),
    maxPriorityFeePerGas: serializeGasValue(feesPerGas.maxPriorityFeePerGas),
    updatedAt: new Date().toISOString(),
  };
}