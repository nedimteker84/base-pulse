# CheckIn Contract

`CheckIn.sol` stores the latest check-in timestamp for each wallet address and rejects repeat check-ins until 24 hours have passed.

## Base Sepolia deployment option

This project does not currently include Solidity tooling. A simple deployment path is to add Hardhat later and deploy to Base Sepolia with these environment variables:

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0x...
```

Suggested deploy command after adding Hardhat:

```bash
npx hardhat ignition deploy ignition/modules/CheckIn.ts --network baseSepolia
```

Suggested Base Sepolia network config:

```ts
baseSepolia: {
  url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
  accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
  chainId: 84532,
}
```

After deployment, save the contract address for the upcoming wagmi frontend integration.