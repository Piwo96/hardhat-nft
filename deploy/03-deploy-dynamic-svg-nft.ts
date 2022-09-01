import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { verify } from "../utils/verify";
import "dotenv/config";
import fs from "fs";

const deployDynamicSvgNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { network, deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const chainId = network.config.chainId!;
    const { deployer } = await getNamedAccounts();

    let priceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const priceFeed = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
        priceFeedAddress = priceFeed.address;
    } else {
        priceFeedAddress = networkConfig[chainId].ethUsdPriceFeedAddress;
    }

    const lowSVG = fs.readFileSync("./images/dynamic-nft/frown.svg", {
        encoding: "utf-8",
    });
    const highSVG = fs.readFileSync("./images/dynamic-nft/happy.svg", {
        encoding: "utf-8",
    });

    const args: any = [priceFeedAddress, lowSVG, highSVG];
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        contract: "DynamicSvgNft",
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: networkConfig[chainId].blockConfirmations,
    });

    log("DynamicSvgNft deployed!");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(dynamicSvgNft.address, args);
    }

    log("----------------------------------------");
};

export default deployDynamicSvgNft;
deployDynamicSvgNft.tags = ["all", "dynamicSvgNft", "main"];
