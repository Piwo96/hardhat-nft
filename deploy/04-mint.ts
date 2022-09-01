import { ethers, network, getNamedAccounts } from "hardhat";
import { resolve } from "path";
import {
    BasicNFT,
    RandomIpfsNFT,
    DynamicSvgNft,
    VRFCoordinatorV2Mock,
} from "../typechain-types";
import { developmentChains } from "../helper-hardhat-config";
import { DeployFunction } from "hardhat-deploy/types";

const mint: DeployFunction = async () => {
    const { deployer } = await getNamedAccounts();

    // Basic NFT
    // const basicNft: BasicNFT = await ethers.getContract("BasicNFT", deployer);
    // const basicMintTx = await basicNft.mintNft();
    // await basicMintTx.wait(1);
    // console.log(
    //     `Basic NFT index 0 has tokenURI: ${await basicNft.tokenURI(0)}`
    // );

    // RandomIpfsNFT

    // const randomIpfsNft: RandomIpfsNFT = await ethers.getContract(
    //     "RandomIpfsNFT",
    //     deployer
    // );
    // const mintFee = await randomIpfsNft.getMintFee();
    // await new Promise<void>(async (resolve, reject) => {
    //     setTimeout(resolve, 300000);
    //     randomIpfsNft.once("NftMinted", async function () {
    //         try {
    //             resolve();
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    //     const randomMintTx = await randomIpfsNft.requestNft({ value: mintFee });
    //     const randomMintTxReceipt = await randomMintTx.wait(1);
    //     if (developmentChains.includes(network.name)) {
    //         const requestId = randomMintTxReceipt.events![1].args!.requestId;
    //         const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock =
    //             await ethers.getContract("VRFCoordinatorV2Mock", deployer);
    //         await vrfCoordinatorV2Mock.fulfillRandomWords(
    //             requestId,
    //             randomIpfsNft.address
    //         );
    //     }
    // });
    // console.log(
    //     `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
    // );

    // Dynamic SVG NFT

    const highValue = ethers.utils.parseEther("4000");
    const dynamicSvgNft: DynamicSvgNft = await ethers.getContract(
        "DynamicSvgNft",
        deployer
    );
    const dynamicMintTx = await dynamicSvgNft.mintNft(highValue);
    await dynamicMintTx.wait(1);
    console.log(
        `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
    );
};

export default mint;
mint.tags = ["all", "mint"];
