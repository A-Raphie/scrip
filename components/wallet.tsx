"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createWalletClient, custom, type Address, type WalletClient } from "viem";
import { base } from "viem/chains";

type WalletCtx = {
  address: Address | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletClient: WalletClient | null;
};

const Ctx = createContext<WalletCtx>({
  address: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  walletClient: null,
});

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const connect = async () => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) {
      alert("No wallet found. Open this page inside the Base app or install a wallet.");
      return;
    }
    setConnecting(true);
    try {
      const client = createWalletClient({ chain: base, transport: custom(eth) });
      const [addr] = await client.requestAddresses();
      // make sure we are on Base
      try {
        await eth.switchChain?.({ chainId: "0x2105" });
      } catch {
        try {
          await eth.request?.({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch {
          // user declined; reads still work, writes will fail loudly
        }
      }
      setWalletClient(client);
      setAddress(addr);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletClient(null);
  };

  useEffect(() => {
    // silently reconnect if the wallet is already authorized
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) return;
    eth.request?.({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts?.[0]) {
          setWalletClient(createWalletClient({ chain: base, transport: custom(eth) }));
          setAddress(accounts[0] as Address);
        }
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ address, connecting, connect, disconnect, walletClient }),
    [address, connecting, walletClient],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  return useContext(Ctx);
}
