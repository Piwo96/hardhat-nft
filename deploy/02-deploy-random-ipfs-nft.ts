import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata";
import { metadataTemplate } from "../utils/metadata";

const VRF_FOUND_AMOUNT = ethers.utils.parseUnits("10");
const imagesLocation = "./images/random-nft";
let tokenUris = [
    "ipfs://QmYMB4EAggdV84QR8L3ZWBohysjSP1UDAAtUv1JhffQu2u",
    "ipfs://QmY3VN2pD16rWNewSQXjhZPKBxSQR4CNeRNnSBWVUoZ9kv",
    "ipfs://QmTwcXGsLWwnvc3yLaCdXmx76Aw3rrKUszQbZpzkrSDXAe",
];

const deployRandomIpfsNft: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris();
    }

    let vrfCoordinatorV2Address, vrfCoordinatorV2Mock, subscriptionId;

    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
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
    const mintFee = networkConfig[chainId].mintFee!;
    const waitConfirmations = networkConfig[chainId].blockConfirmations;

    const args: any = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasHash,
        callbackGasLimit,
        tokenUris,
        mintFee,
    ];
    const randomIpfsNft = await deploy("RandomIpfsNFT", {
        contract: "RandomIpfsNFT",
        from: deployer,
        log: true,
        waitConfirmations: waitConfirmations,
        args: args,
    });

    log("RandomIpfsNft deployed!");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(randomIpfsNft.address, args);
    }

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        );
        await vrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            randomIpfsNft.address
        );
    }
    log("-------------------------------------------------");
};

async function handleTokenUris() {
    let tokenUris: any = [];
    const { responses: imageUploadResponses, files } = await storeImages(
        imagesLocation
    );
    for (var imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(
            ".png",
            ""
        );
        tokenUriMetadata.description = `An adorabele ${tokenUriMetadata.name} pup!`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name} ...`);
        const metadataUploadResponse = await storeTokenUriMetadata(
            tokenUriMetadata
        );
        tokenUris.push(`ipfs://${metadataUploadResponse?.IpfsHash}`);
    }
    console.log("Token URIs uploaded! They are:");
    console.log(tokenUris);
    return tokenUris;
}

export default deployRandomIpfsNft;
deployRandomIpfsNft.tags = ["all", "randomIpfsNft", "main"];
