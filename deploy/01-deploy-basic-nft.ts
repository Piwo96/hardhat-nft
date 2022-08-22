import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BasicNFT } from "../typechain-types";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployBasicNFT: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId: number = network.config.chainId!;

    const blockConfirmations = networkConfig[chainId].blockConfirmations;

    const args: any = [];
    const basicNft = await deploy("BasicNFT", {
        contract: "BasicNFT",
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: blockConfirmations,
    });

    log("BasicNFT deployed!");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying ...");
        await verify(basicNft.address, args);
    }

    log("--------------------------------------");
};

export default deployBasicNFT;
deployBasicNFT.tags = ["all", "basicNft"];
