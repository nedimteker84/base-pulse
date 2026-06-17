# CheckIn Contract

`CheckIn.sol` stores the latest check-in timestamp for each wallet address and rejects repeat check-ins until 24 hours have passed.

## Base Sepolia deployment option

This project uses Hardhat to compile and deploy the contract. Configure these environment variables in `.env.local` or your shell:

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0x...
```

Compile the contract:

```bash
npm run compile:contracts
```

Deploy to Base Sepolia:

```bash
npm run deploy:checkin:base-sepolia
```

After deployment, save the contract address for the upcoming wagmi frontend integration.