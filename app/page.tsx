"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Base Pulse</h1>
      </div>

      <div className="flex flex-col items-center gap-6 p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <ConnectButton />
        
        {isConnected ? (
          <button 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all"
            onClick={() => alert("Check-in işlemi başlatılıyor...")}
          >
            Check in
          </button>
        ) : (
          <p className="text-gray-400">Lütfen cüzdanınızı bağlayın.</p>
        )}
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Base ekosistemindeki günlük check-in istasyonunuz.</p>
      </div>
    </main>
  );
}