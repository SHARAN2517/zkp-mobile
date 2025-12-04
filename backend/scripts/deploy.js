const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying ZK-IoTChain contracts to ${network}...`);
  console.log("==========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy ZKPVerifier
  console.log("📝 Deploying ZKPVerifier...");
  const ZKPVerifier = await hre.ethers.getContractFactory("ZKPVerifier");
  const zkpVerifier = await ZKPVerifier.deploy();
  await zkpVerifier.waitForDeployment();
  const zkpVerifierAddress = await zkpVerifier.getAddress();
  console.log("✅ ZKPVerifier deployed to:", zkpVerifierAddress);

  // Deploy DeviceRegistry
  console.log("\n📝 Deploying DeviceRegistry...");
  const DeviceRegistry = await hre.ethers.getContractFactory("DeviceRegistry");
  const deviceRegistry = await DeviceRegistry.deploy(zkpVerifierAddress);
  await deviceRegistry.waitForDeployment();
  const deviceRegistryAddress = await deviceRegistry.getAddress();
  console.log("✅ DeviceRegistry deployed to:", deviceRegistryAddress);

  // Deploy MerkleAnchor
  console.log("\n📝 Deploying MerkleAnchor...");
  const MerkleAnchor = await hre.ethers.getContractFactory("MerkleAnchor");
  const merkleAnchor = await MerkleAnchor.deploy();
  await merkleAnchor.waitForDeployment();
  const merkleAnchorAddress = await merkleAnchor.getAddress();
  console.log("✅ MerkleAnchor deployed to:", merkleAnchorAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: network,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ZKPVerifier: zkpVerifierAddress,
      DeviceRegistry: deviceRegistryAddress,
      MerkleAnchor: merkleAnchorAddress
    },
    gasUsed: {
      ZKPVerifier: (await zkpVerifier.deploymentTransaction().wait()).gasUsed.toString(),
      DeviceRegistry: (await deviceRegistry.deploymentTransaction().wait()).gasUsed.toString(),
      MerkleAnchor: (await merkleAnchor.deploymentTransaction().wait()).gasUsed.toString()
    }
  };

  const filename = `deployment-${network}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n==========================================");
  console.log("✅ Deployment Complete!");
  console.log("==========================================");
  console.log(`📄 Deployment info saved to: ${filename}`);
  console.log("\nContract Addresses:");
  console.log("  ZKPVerifier:    ", zkpVerifierAddress);
  console.log("  DeviceRegistry: ", deviceRegistryAddress);
  console.log("  MerkleAnchor:   ", merkleAnchorAddress);

  // Get network info
  const networkInfo = {
    'sepolia': { explorer: 'https://sepolia.etherscan.io', name: 'Ethereum Sepolia' },
    'polygonMumbai': { explorer: 'https://mumbai.polygonscan.com', name: 'Polygon Mumbai' },
    'polygon': { explorer: 'https://polygonscan.com', name: 'Polygon Mainnet' },
    'bscTestnet': { explorer: 'https://testnet.bscscan.com', name: 'BSC Testnet' },
    'bsc': { explorer: 'https://bscscan.com', name: 'BSC Mainnet' }
  };

  if (networkInfo[network]) {
    console.log(`\n🔍 View on ${networkInfo[network].name} Explorer:`);
    console.log(`  ${networkInfo[network].explorer}/address/${zkpVerifierAddress}`);
    console.log(`  ${networkInfo[network].explorer}/address/${deviceRegistryAddress}`);
    console.log(`  ${networkInfo[network].explorer}/address/${merkleAnchorAddress}`);
  }

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
