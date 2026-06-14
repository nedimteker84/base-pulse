"use client";

import { useQuery } from "@tanstack/react-query";
import { formatGwei } from "viem";
import { base } from "wagmi/chains";
import {
  useBlockNumber,
  useEstimateFeesPerGas,
  useGasPrice,
} from "wagmi";
import { ShareBasePulseButton } from "./ShareBasePulseButton";

const REFRESH_INTERVAL_MS = 15_000;

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

export function BasePulseDashboard() {
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

  const isGasLoading = gasPrice.isLoading || feesPerGas.isLoading;
  const hasGasError = gasPrice.isError || feesPerGas.isError;
  const interactionCount = interactions.data?.interactions.length ?? 0;

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
      </div>
    </main>
  );
}