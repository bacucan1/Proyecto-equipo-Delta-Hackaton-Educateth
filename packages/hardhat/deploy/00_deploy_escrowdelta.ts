import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the Escrowdelta contract using the deployer account.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployEscrowdelta: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Escrowdelta", {
    from: deployer,
    log: true,
    autoMine: true, // Makes the deployment process faster on local networks.
  });

  console.log("✅ Escrowdelta contract deployed successfully!");
};

export default deployEscrowdelta;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Escrowdelta
deployEscrowdelta.tags = ["Escrowdelta"];

