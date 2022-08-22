import { ethers, network } from "hardhat";
import { BasicNFT } from "../../typechain-types";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", function () {
          let basicNft: BasicNFT;
          let deployer: SignerWithAddress;
          this.beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              basicNft = await ethers.getContract("BasicNFT", deployer.address);
          });

          it("Allows people to mint a NFT", async function () {
              await basicNft.mintNft();
              const balance = await basicNft.balanceOf(deployer.address);
              assert.equal(balance.toString(), "1");
          });
      });
