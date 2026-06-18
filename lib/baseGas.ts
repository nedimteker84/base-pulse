import { createPublicClient, formatGwei, http } from "viem";
import { configuredChain, configuredRpcUrl } from "./chains";

const baseClient = createPublicClient({
  chain: configuredChain,
  transport: http(configuredRpcUrl),
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
    chainId: configuredChain.id,
    chainName: configuredChain.name,
    blockNumber: blockNumber.toString(),
    gasPrice: serializeGasValue(gasPrice),
    maxFeePerGas: serializeGasValue(feesPerGas.maxFeePerGas),
    maxPriorityFeePerGas: serializeGasValue(feesPerGas.maxPriorityFeePerGas),
    updatedAt: new Date().toISOString(),
  };
}