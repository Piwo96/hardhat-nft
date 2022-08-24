import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const VRF_FOUND_AMOUNT = ethers.utils.parseEther("0.25");
const mintFee = ethers.utils.parseEther("0.01");

const deployRandomIpfsNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    let tokenUris;
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    let vrfCoordinatorV2Address, subscriptionId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        );
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);
        subscriptionId = txReceipt.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(
            subscriptionId,
            VRF_FOUND_AMOUNT
        );
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].VRFCoordinatorAddress;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    const gasHash = networkConfig[chainId].gasHash!;
    const callbackGasLimit = networkConfig[chainId].callbackGasLimit!;

    const args: any = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasHash,
        callbackGasLimit,
        // dogTokenUris,
        mintFee,
    ];
    const randomIpfsNft = await deploy("RandomIpfsNFT", {
        contract: "RandomIpfsNFT",
        from: deployer,
        log: true,
        waitConfirmations: 0,
        args: args,
    });

    log("RandomIpfsNft deployed!");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(randomIpfsNft.address, args);
    }
    log("-------------------------------------------------");
};

async function handleTokenUris() {
    let tokenUris: any = [];

    return tokenUris;
}
