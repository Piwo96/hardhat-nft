import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helper-hardhat-config";

const deployDynamicSvgNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { network, deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const chainId = network.config.chainId;
};

export default deployDynamicSvgNft;
deployDynamicSvgNft.tags = ["all", "dynamicSvgNft"];
