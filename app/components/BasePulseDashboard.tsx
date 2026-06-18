"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { encodeFunctionData, formatEther, formatGwei, isAddress } from "viem";
import {
  useAccount,
  useBlockNumber,
  useConnect,
  useEstimateGas,
  useEstimateFeesPerGas,
  useGasPrice,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { configuredChain } from "../../lib/chains";

const REFRESH_INTERVAL_MS = 15_000;
const CHECK_IN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const CHECK_IN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS?.trim();

const checkInAbi = [
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lastCheckInAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const checkInCallData = encodeFunctionData({
  abi: checkInAbi,
  functionName: "checkIn",
});

export function BasePulseDashboard() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  
  const availableConnectors = useMemo(() => connectors.filter((c) => c.ready), [connectors]);
  const checkInContractAddress = useMemo(() => 
    CHECK_IN_CONTRACT_ADDRESS && isAddress(CHECK_IN_CONTRACT_ADDRESS) ? CHECK_IN_CONTRACT_ADDRESS : undefined, 
  []);

  const { data: checkInHash, isPending: isWritePending, writeContractAsync } = useWriteContract();
  const [now, setNow] = useState(() => Date.now());
  
  const gasPrice = useGasPrice({ query: { refetchInterval: REFRESH_INTERVAL_MS } });
  const feesPerGas = useEstimateFeesPerGas({ query: { refetchInterval: REFRESH_INTERVAL_MS } });
  
  const lastCheckIn = useReadContract({
    address: checkInContractAddress,
    abi: checkInAbi,
    functionName: "lastCheckInAt",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(checkInContractAddress && address), refetchInterval: REFRESH_INTERVAL_MS },
  });

  const lastCheckInAt = lastCheckIn.data ? Number(lastCheckIn.data) * 1000 : null;
  const nextCheckInAt = lastCheckInAt ? lastCheckInAt + CHECK_IN_INTERVAL_MS : null;
  const remainingCheckInMs = nextCheckInAt ? nextCheckInAt - now : 0;
  const canCheckIn = !lastCheckInAt || remainingCheckInMs <= 0;
  
  const gasEstimate = useEstimateGas({
    account: address,
    data: checkInCallData,
    to: checkInContractAddress,
    query: { enabled: Boolean(checkInContractAddress && address && canCheckIn), refetchInterval: REFRESH_INTERVAL_MS },
  });

  const checkInReceipt = useWaitForTransactionReceipt({ hash: checkInHash });

  const hasCheckInConfig = Boolean(checkInContractAddress);
  const hasPendingCheckIn = isWritePending || checkInReceipt.isLoading;
  const checkInButtonLabel = !hasCheckInConfig ? "Contract not configured" : !isConnected ? "Connect wallet to check in" : isWritePending ? "Confirm in wallet" : checkInReceipt.isLoading ? "Recording on-chain" : canCheckIn ? "Check in" : "Check-in recorded";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function handleDailyCheckIn() {
    if (!checkInContractAddress || !isConnected || !canCheckIn || hasPendingCheckIn) return;
    await writeContractAsync({
      address: checkInContractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
    });
  }

  async function handleWalletConnect(connector: (typeof connectors)[number]) {
    await connectAsync({ connector });
  }

  return (
    <main className="min-h-screen bg-black px-4 py-5 text-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h1 className="text-xl font-semibold">Base Pulse</h1>
        </section>
        
        <button
            type="button"
            onClick={handleDailyCheckIn}
            disabled={!isConnected || !canCheckIn || hasPendingCheckIn}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white"
          >
            {checkInButtonLabel}
        </button>

        {!isConnected && (
            <div className="grid gap-2">
              {availableConnectors.map((connector) => (
                <button key={connector.uid} onClick={() => handleWalletConnect(connector)} className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  Connect {connector.name}
                </button>
              ))}
            </div>
        )}
      </div>
    </main>
  );
}