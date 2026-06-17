const hre = require("hardhat");

async function main() {
  const CheckIn = await hre.ethers.getContractFactory("CheckIn");
  const checkIn = await CheckIn.deploy();

  await checkIn.waitForDeployment();

  const address = await checkIn.getAddress();

  console.log(`CheckIn deployed to ${address} on ${hre.network.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});