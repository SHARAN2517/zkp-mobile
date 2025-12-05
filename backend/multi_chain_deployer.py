#!/usr/bin/env python3
"""
Multi-Chain Deployer Script
Deploys smart contracts to multiple blockchain networks
"""

import subprocess
import json
import os
from pathlib import Path
from typing import Dict, List
import time

# Supported networks
NETWORKS = [
    {"name": "sepolia", "displayName": "Ethereum Sepolia"},
    {"name": "polygonMumbai", "displayName": "Polygon Mumbai"},
    {"name": "bscTestnet", "displayName": "BSC Testnet"},
    {"name": "arbitrumSepolia", "displayName": "Arbitrum Sepolia"},
    {"name": "optimismSepolia", "displayName": "Optimism Sepolia"},
    {"name": "avalancheFuji", "displayName": "Avalanche Fuji"},
]

class MultiChainDeployer:
    def __init__(self, backend_dir: str = "."):
        self.backend_dir = Path(backend_dir)
        self.deployments: Dict[str, Dict] = {}
        
    def deploy_to_network(self, network: str) -> Dict:
        """Deploy contracts to a single network"""
        print(f"\n{'='*60}")
        print(f"🚀 Deploying to {network}...")
        print(f"{'='*60}")
        
        try:
            # Run hardhat deployment script
            result = subprocess.run(
                ["npx", "hardhat", "run", "scripts/deploy.js", "--network", network],
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                print(f"✅ Successfully deployed to {network}")
                print(result.stdout)
                
                # Parse deployment info from output or file
                deployment_file = self.backend_dir / f"deployment-{network}.json"
                if deployment_file.exists():
                    with open(deployment_file, 'r') as f:
                        deployment_info = json.load(f)
                    return {
                        "success": True,
                        "network": network,
                        "deployment": deployment_info
                    }
                else:
                    return {
                        "success": True,
                        "network": network,
                        "message": "Deployed but no deployment file found"
                    }
            else:
                print(f"❌ Deployment failed for {network}")
                print(f"Error: {result.stderr}")
                return {
                    "success": False,
                    "network": network,
                    "error": result.stderr
                }
                
        except subprocess.TimeoutExpired:
            print(f"⏱️ Deployment timed out for {network}")
            return {
                "success": False,
                "network": network,
                "error": "Deployment timed out"
            }
        except Exception as e:
            print(f"❌ Error deploying to {network}: {e}")
            return {
                "success": False,
                "network": network,
                "error": str(e)
            }
            
    def deploy_to_all_networks(self, networks: List[Dict] = None) -> Dict:
        """Deploy to all specified networks"""
        if networks is None:
            networks = NETWORKS
            
        print("\n" + "="*60)
        print("🌍 MULTI-CHAIN DEPLOYMENT STARTED")
        print("="*60)
        print(f"Total networks: {len(networks)}")
        print(f"Networks: {', '.join([n['displayName'] for n in networks])}")
        print("="*60)
        
       results = {}
        successful = 0
        failed = 0
        
        for network_info in networks:
            network = network_info["name"]
            
            # Deploy to network
            result = self.deploy_to_network(network)
            results[network] = result
            
            if result["success"]:
                successful += 1
                self.deployments[network] = result.get("deployment", {})
            else:
                failed += 1
                
            # Small delay between deployments
            time.sleep(2)
            
        # Generate deployment report
        self.generate_report(results, successful, failed)
        
        return {
            "total": len(networks),
            "successful": successful,
            "failed": failed,
            "results": results
        }
        
    def generate_report(self, results: Dict, successful: int, failed: int):
        """Generate and save deployment report"""
        print("\n" + "="*60)
        print("📊 DEPLOYMENT REPORT")
        print("="*60)
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(successful/(successful+failed)*100):.1f}%")
        print("="*60)
        
        # Print individual results
        for network, result in results.items():
            status = "✅" if result["success"] else "❌"
            print(f"{status} {network}")
            if result["success"] and "deployment" in result:
                deployment = result["deployment"]
                if "contracts" in deployment:
                    for contract_name, address in deployment["contracts"].items():
                        print(f"    {contract_name}: {address}")
                        
        # Save report to file
        report_file = self.backend_dir / "multi-chain-deployment-report.json"
        with open(report_file, 'w') as f:
            json.dump({
                "timestamp": time.time(),
                "successful": successful,
                "failed": failed,
                "results": results,
                "deployments": self.deployments
            }, f, indent=2)
            
        print(f"\n📄 Full report saved to: {report_file}")
        

def main():
    """Main deployment function"""
    # Get backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    deployer = MultiChainDeployer(backend_dir)
    
    # Deploy to all testnets
    results = deployer.deploy_to_all_networks(NETWORKS)
    
    print("\n" + "="*60)
    print("🎯 MULTI-CHAIN DEPLOYMENT COMPLETED")
    print("="*60)
    

if __name__ == "__main__":
    main()
