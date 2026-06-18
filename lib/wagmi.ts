import { createConfig, http, injected } from "wagmi";
import { base } from "wagmi/chains"; 

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [injected()],
  transports: {
    [base.id]: http(),
  },
});