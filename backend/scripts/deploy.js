const hre = require('hardhat');

async function main() {
  console.log('\n🚀 Deploying ZK-IoTChain Smart Contracts...');
  console.log('Network:', hre.network.name);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer address:', deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', hre.ethers.formatEther(balance), 'ETH\n');
  
  // Deploy ZKPVerifier
  console.log('📝 Deploying ZKPVerifier...');
  const ZKPVerifier = await hre.ethers.getContractFactory('ZKPVerifier');
  const zkpVerifier = await ZKPVerifier.deploy();
  await zkpVerifier.waitForDeployment();
  const zkpVerifierAddress = await zkpVerifier.getAddress();
  console.log('✅ ZKPVerifier deployed to:', zkpVerifierAddress);
  
  // Deploy DeviceRegistry
  console.log('\n📝 Deploying DeviceRegistry...');
  const DeviceRegistry = await hre.ethers.getContractFactory('DeviceRegistry');
  const deviceRegistry = await DeviceRegistry.deploy(zkpVerifierAddress);
  await deviceRegistry.waitForDeployment();
  const deviceRegistryAddress = await deviceRegistry.getAddress();
  console.log('✅ DeviceRegistry deployed to:', deviceRegistryAddress);
  
  // Deploy MerkleAnchor
  console.log('\n📝 Deploying MerkleAnchor...');
  const MerkleAnchor = await hre.ethers.getContractFactory('MerkleAnchor');
  const merkleAnchor = await MerkleAnchor.deploy();
  await merkleAnchor.waitForDeployment();
  const merkleAnchorAddress = await merkleAnchor.getAddress();
  console.log('✅ MerkleAnchor deployed to:', merkleAnchorAddress);
  
  console.log('\n✨ Deployment Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ZKPVerifier     :', zkpVerifierAddress);
  console.log('DeviceRegistry  :', deviceRegistryAddress);
  console.log('MerkleAnchor    :', merkleAnchorAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Save deployment addresses
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      ZKPVerifier: zkpVerifierAddress,
      DeviceRegistry: deviceRegistryAddress,
      MerkleAnchor: merkleAnchorAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    './deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\n💾 Deployment info saved to deployment.json');
  
  if (hre.network.name === 'sepolia') {
    console.log('\n⏳ Waiting for block confirmations...');
    await zkpVerifier.deploymentTransaction().wait(5);
    
    console.log('\n🔍 Verifying contracts on Etherscan...');
    try {
      await hre.run('verify:verify', {
        address: zkpVerifierAddress,
        constructorArguments: [],
      });
      
      await hre.run('verify:verify', {
        address: deviceRegistryAddress,
        constructorArguments: [zkpVerifierAddress],
      });
      
      await hre.run('verify:verify', {
        address: merkleAnchorAddress,
        constructorArguments: [],
      });
      
      console.log('✅ Contracts verified on Etherscan');
    } catch (error) {
      console.log('⚠️ Verification error:', error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
