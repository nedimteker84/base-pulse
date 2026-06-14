import { ShareBasePulseButton } from "./components/ShareBasePulseButton";

export default function Home() {
  const trendingInteractions = [
    {
      name: "Base Bridge",
      action: "Deposits + withdrawals",
      status: "High activity",
      address: "0x4200...0010",
    },
    {
      name: "Onchain Social",
      action: "Mints + profile actions",
      status: "Rising",
      address: "Base ecosystem",
    },
    {
      name: "DEX Routers",
      action: "Swaps + liquidity",
      status: "Trending",
      address: "Multiple contracts",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,82,255,0.28),_transparent_34%),linear-gradient(180deg,#050816_0%,#070b17_100%)] px-4 py-5 text-zinc-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-blue-300">
                Base Pulse
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Live network signal for Base.
              </h1>
            </div>
            <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-[11px] font-medium text-blue-200">
              Mini App
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            Track current gas, watch contract interaction trends, and share the
            pulse back to Farcaster.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">Base gas</p>
              <p className="mt-1 text-4xl font-semibold text-white">Live</p>
            </div>
            <div className="rounded-2xl bg-blue-500/10 px-4 py-3 text-right">
              <p className="text-xs text-blue-200">Viem source</p>
              <p className="mt-1 text-sm font-medium text-white">Coming next</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Max fee</p>
              <p className="mt-1 font-medium text-zinc-100">RPC-backed</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-zinc-500">Refresh</p>
              <p className="mt-1 font-medium text-zinc-100">~15 seconds</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Trending interactions
            </h2>
            <span className="text-xs text-zinc-500">MVP feed</span>
          </div>
          <div className="space-y-3">
            {trendingInteractions.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.action}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-xs text-zinc-500">{item.address}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-zinc-400">Farcaster sharing</p>
          <ShareBasePulseButton />
        </section>
      </div>
      </main>
  );
}
