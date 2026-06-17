"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  encodeFunctionData,
  formatEther,
  formatGwei,
  isAddress,
} from "viem";
import { base } from "wagmi/chains";
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
import { ShareBasePulseButton } from "./ShareBasePulseButton";

const REFRESH_INTERVAL_MS = 15_000;
const CHECK_IN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const CHECK_IN_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;

const checkInContractAddress =
  CHECK_IN_CONTRACT_ADDRESS && isAddress(CHECK_IN_CONTRACT_ADDRESS)
    ? CHECK_IN_CONTRACT_ADDRESS
    : undefined;

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

type TrendingInteraction = {
  name: string;
  action: string;
  status: string;
  address: string;
  shortAddress: string;
  interactionCount: number;
  latestBlock: string;
};

type InteractionsResponse = {
  interactions: TrendingInteraction[];
  updatedAt: string;
};

async function fetchInteractions() {
  const response = await fetch("/api/interactions");

  if (!response.ok) {
    throw new Error("Unable to load trending interactions");
  }

  return response.json() as Promise<InteractionsResponse>;
}

function formatGasValue(value?: bigint) {
  if (!value) return "—";

  return Number(formatGwei(value)).toFixed(4);
}

function formatTime(value?: string | number | Date) {
  if (!value) return "Loading";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatBaseFee(value?: bigint) {
  if (value === undefined) return "Estimating";

  return `${Number(formatEther(value)).toFixed(8)} ETH`;
}

export function BasePulseDashboard() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnectPending } = useConnect();
  const {
    data: checkInHash,
    error: checkInError,
    isPending: isWritePending,
    writeContractAsync,
  } = useWriteContract();
  const [now, setNow] = useState(() => Date.now());
  const gasPrice = useGasPrice({
    chainId: base.id,
    query: { refetchInterval: REFRESH_INTERVAL_MS },
  });
  const feesPerGas = useEstimateFeesPerGas({
    chainId: base.id,
    query: { refetchInterval: REFRESH_INTERVAL_MS },
  });
  const blockNumber = useBlockNumber({
    chainId: base.id,
    query: { refetchInterval: REFRESH_INTERVAL_MS },
  });
  const interactions = useQuery({
    queryKey: ["base-interactions"],
    queryFn: fetchInteractions,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
  const lastCheckIn = useReadContract({
    address: checkInContractAddress,
    abi: checkInAbi,
    functionName: "lastCheckInAt",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: Boolean(checkInContractAddress && address),
      refetchInterval: REFRESH_INTERVAL_MS,
    },
  });
  const lastCheckInAt = lastCheckIn.data
    ? Number(lastCheckIn.data) * 1000
    : null;
  const nextCheckInAt = lastCheckInAt
    ? lastCheckInAt + CHECK_IN_INTERVAL_MS
    : null;
  const remainingCheckInMs = nextCheckInAt ? nextCheckInAt - now : 0;
  const canCheckIn = !lastCheckInAt || remainingCheckInMs <= 0;
  const gasEstimate = useEstimateGas({
    account: address,
    chainId: base.id,
    data: checkInCallData,
    to: checkInContractAddress,
    query: {
      enabled: Boolean(checkInContractAddress && address && canCheckIn),
      refetchInterval: REFRESH_INTERVAL_MS,
    },
  });
  const checkInReceipt = useWaitForTransactionReceipt({
    hash: checkInHash,
    chainId: base.id,
  });

  const isGasLoading = gasPrice.isLoading || feesPerGas.isLoading;
  const hasGasError = gasPrice.isError || feesPerGas.isError;
  const interactionCount = interactions.data?.interactions.length ?? 0;
  const countdownLabel = canCheckIn
    ? "Available now"
    : formatCountdown(remainingCheckInMs);
  const lastCheckInLabel = useMemo(() => {
    if (!lastCheckInAt) return "No check-in yet";

    return formatTime(lastCheckInAt);
  }, [lastCheckInAt]);
  const estimatedCheckInFee = useMemo(() => {
    const maxFeePerGas = feesPerGas.data?.maxFeePerGas ?? gasPrice.data;

    if (!gasEstimate.data || !maxFeePerGas) return undefined;

    return gasEstimate.data * maxFeePerGas;
  }, [feesPerGas.data?.maxFeePerGas, gasEstimate.data, gasPrice.data]);
  const hasCheckInConfig = Boolean(checkInContractAddress);
  const hasPendingCheckIn = isWritePending || checkInReceipt.isLoading;
  const isCheckInDisabled =
    !hasCheckInConfig || !canCheckIn || hasPendingCheckIn || isConnectPending;
  const checkInButtonLabel = !hasCheckInConfig
    ? "Contract not configured"
    : !isConnected
      ? "Connect wallet to check in"
      : isWritePending
        ? "Confirm in wallet"
        : checkInReceipt.isLoading
          ? "Recording on-chain"
          : canCheckIn
            ? "Check in on Base"
            : "Check-in recorded";
  const checkInStatusLabel = checkInReceipt.isSuccess
    ? "Check-in confirmed on Base."
    : checkInError
      ? checkInError.message
      : gasEstimate.isError
        ? "Gas estimate unavailable. Your wallet will show the final fee before signing."
        : "You will approve this Base transaction in your wallet.";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (checkInReceipt.isSuccess) {
      lastCheckIn.refetch();
    }
  }, [checkInReceipt.isSuccess, lastCheckIn]);

  async function handleDailyCheckIn() {
    if (!checkInContractAddress || !canCheckIn || hasPendingCheckIn) return;

    if (!isConnected) {
      const connector = connectors[0];

      if (!connector) return;

      await connectAsync({ connector, chainId: base.id });
      return;
    }

    await writeContractAsync({
      address: checkInContractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: base.id,
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,82,255,0.28),_transparent_34%),linear-gradient(180deg,#050816_0%,#070b17_100%)] px-4 py-5 text-zinc-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-2xl lg:max-w-4xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-300">
                Base Pulse
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Live network signal for Base.
              </h1>
            </div>
            <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-[11px] font-medium text-blue-200">
              Mini App
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300 sm:max-w-xl">
            Track current gas, watch contract interaction trends, and share the
            pulse back to Farcaster. Data refreshes every 15 seconds.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">Base gas</p>
              <p className="mt-1 text-4xl font-semibold text-white">
                {isGasLoading ? "Loading" : `${formatGasValue(gasPrice.data)} gwei`}
              </p>
              {hasGasError ? (
                <p className="mt-2 text-xs text-rose-300">
                  Gas feed is temporarily unavailable.
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl bg-blue-500/10 px-4 py-3 text-left sm:text-right">
              <p className="text-xs text-blue-200">Wagmi + viem source</p>
              <p className="mt-1 text-sm font-medium text-white">
                Updated {formatTime(gasPrice.dataUpdatedAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Max fee</p>
              <p className="mt-1 font-medium text-zinc-100">
                {formatGasValue(feesPerGas.data?.maxFeePerGas)} gwei
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Priority</p>
              <p className="mt-1 font-medium text-zinc-100">
                {formatGasValue(feesPerGas.data?.maxPriorityFeePerGas)} gwei
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Block</p>
              <p className="mt-1 font-medium text-zinc-100">
                {blockNumber.data?.toString() ?? "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Refresh</p>
              <p className="mt-1 font-medium text-zinc-100">15 seconds</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Trending interactions
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Top contracts from recent Base blocks
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
              {interactions.isLoading ? "Syncing" : `${interactionCount} live`}
            </span>
          </div>
          <div className="space-y-3">
            {interactions.isError ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                Trending interactions are temporarily unavailable.
              </div>
            ) : null}
            {interactions.isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl border border-white/10 bg-zinc-950/70"
                  />
                ))
              : interactions.data?.interactions.map((item) => (
                  <article
                    key={item.address}
                    className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          {item.action}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span>{item.shortAddress}</span>
                      <span>{item.interactionCount} txs</span>
                      <span>Block {item.latestBlock}</span>
                    </div>
                  </article>
                ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Updated {formatTime(interactions.data?.updatedAt)} via viem RPC scan.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
          <p className="text-sm text-zinc-400">Farcaster sharing</p>
          <ShareBasePulseButton />
        </section>

        <section className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-blue-200">
                Daily Check-in
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Keep your Base Pulse streak alive.
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Check in once every 24 hours with a wallet signature. This is
                an on-chain Base transaction, so it requires a small gas fee.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:min-w-56">
              <p className="text-xs text-zinc-500">Next check-in</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">
                {countdownLabel}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Last: {lastCheckInLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
              <p className="text-xs text-zinc-500">Estimated network fee</p>
              <p className="mt-1 font-semibold text-white">
                {formatBaseFee(estimatedCheckInFee)}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Estimate uses current Base gas. Your wallet shows the final fee
                before approval.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
              <p className="text-xs text-zinc-500">Contract</p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-200">
                {checkInContractAddress ?? "Set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS"}
              </p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Connected wallet: {address ?? "Not connected"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDailyCheckIn}
            disabled={isCheckInDisabled}
            className="mt-5 w-full rounded-2xl border border-blue-300/30 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-zinc-500 disabled:shadow-none"
          >
            {checkInButtonLabel}
          </button>
          <p
            className={`mt-3 text-xs leading-5 ${
              checkInError || gasEstimate.isError ? "text-amber-200" : "text-zinc-400"
            }`}
          >
            {checkInStatusLabel}
          </p>
        </section>
      </div>
    </main>
  );
}