import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DynamicSvgNft, MockV3Aggregator } from "../../typechain-types";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { ethers, network, deployments } from "hardhat";
import fs from "fs";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("DynamicSvgNft", function () {
          let dynamicSvgNft: DynamicSvgNft;
          let mockV3Aggregator: MockV3Aggregator;
          let deployer: SignerWithAddress;
          let chainId: number;
          this.beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              chainId = network.config.chainId!;
              await deployments.fixture(["all"]);
              dynamicSvgNft = await ethers.getContract(
                  "DynamicSvgNft",
                  deployer
              );
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", function () {
              it("Sets price feed", async function () {
                  // Arrange
                  const priceFeed = mockV3Aggregator.address;

                  // Act
                  const priceFeedFromContract =
                      await dynamicSvgNft.getPriceFeed();

                  // Assert
                  assert.equal(priceFeed, priceFeedFromContract);
              });

              it("Sets token counter to 0", async function () {
                  const tokenCounter = await dynamicSvgNft.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "0");
              });

              it("Sets low image uri", async function () {
                  const baseUri = "data:application/json;base64,";
                  const happySvgPath = "./images/dynamic-nft/happy.svg";
                  const happySvg = fs.readFileSync(happySvgPath, {
                      encoding: "utf-8",
                  });
                  const happySvgBase64Encoded =
                      Buffer.from(happySvg).toString("base64");
                  const lowImageUri = baseUri.concat(happySvgBase64Encoded);
                  const lowImageUriFromContract =
                      await dynamicSvgNft.getLowImageURI();
                  assert.equal(lowImageUri, lowImageUriFromContract);
              });

              it("Sets high image uri", async function () {
                  const baseUri = "data:application/json;base64,";
                  const frownSvgPath = "./images/dynamic-nft/frown.svg";
                  const frownSvg = fs.readFileSync(frownSvgPath, {
                      encoding: "utf-8",
                  });
                  const frownSvgBase64Encoded =
                      Buffer.from(frownSvg).toString("base64");
              });
          });

          describe("mintNft", function () {
              const highValue = 3000;
              it("Maps token id to high value", async function () {
                  await dynamicSvgNft.mintNft(highValue);
                  const highValueFromContract =
                      await dynamicSvgNft.getTokenIdToHighValue(1);
                  assert.equal(highValueFromContract.toNumber(), highValue);
              });

              it("Emits CreatedNFT event", async function () {
                  const txResponse = await dynamicSvgNft.mintNft(highValue);
                  const txReceipt = await txResponse.wait();
                  const tokenId = txReceipt.events![1].args!.tokenId;
                  const highValueFromEvent =
                      txReceipt.events![1].args!.highValue;
                  assert.equal(tokenId.toString(), "1");
                  assert.equal(highValueFromEvent.toNumber(), highValue);
              });
          });

          describe("tokenURI", async function () {
              it("Reverts when token id does not exist", async function () {
                  await expect(dynamicSvgNft.tokenURI(0)).to.be.revertedWith(
                      "URI Query for nonexistent token"
                  );
              });

              it("", async function () {
                  const baseUri = "data:application/json;base64,";
                  const frownSvgPath = "./images/dynamic-nft/frown.svg";
                  const happySvgPath = "./images/dynamic-nft/happy.svg";
                  const frownSvg = fs.readFileSync(frownSvgPath, {
                      encoding: "utf-8",
                  });
                  const happySvg = fs.readFileSync(happySvgPath, {
                      encoding: "utf-8",
                  });
                  const frownSvgBase64Encoded =
                      Buffer.from(frownSvg).toString("base64");
                  const happySvgBase64Encoded =
                      Buffer.from(happySvg).toString("base64");
              });
          });
      });
