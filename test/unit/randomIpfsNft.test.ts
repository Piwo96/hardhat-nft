import { assert, expect } from "chai";
import { ethers, network, deployments } from "hardhat";
import { RandomIpfsNFT, VRFCoordinatorV2Mock } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { BigNumber } from "ethers";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNFT", function () {
          let randomIpfsNft: RandomIpfsNFT;
          let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
          let deployer: SignerWithAddress;
          let chainId: number;
          this.beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              chainId = network.config.chainId!;
              await deployments.fixture(["mocks", "randomIpfsNft"]);
              randomIpfsNft = await ethers.getContract(
                  "RandomIpfsNFT",
                  deployer
              );
              vrfCoordinatorV2Mock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              );
          });

          describe("constructor", function () {
              it("Sets mint fee and tokenUris correctly", async function () {
                  const mintFee = networkConfig[chainId].mintFee!;
                  const tokenUris = [
                      "ipfs://QmYMB4EAggdV84QR8L3ZWBohysjSP1UDAAtUv1JhffQu2u",
                      "ipfs://QmY3VN2pD16rWNewSQXjhZPKBxSQR4CNeRNnSBWVUoZ9kv",
                      "ipfs://QmTwcXGsLWwnvc3yLaCdXmx76Aw3rrKUszQbZpzkrSDXAe",
                  ];

                  const mintFeeFromContract = await randomIpfsNft.getMintFee();
                  const tokenUrisFromContract0 =
                      await randomIpfsNft.getDogTokenUris(0);
                  const tokenUrisFromContract1 =
                      await randomIpfsNft.getDogTokenUris(1);
                  const tokenUrisFromContract2 =
                      await randomIpfsNft.getDogTokenUris(2);

                  assert.equal(mintFeeFromContract.toString(), mintFee);
                  assert.equal(tokenUrisFromContract0, tokenUris[0]);
                  assert.equal(tokenUrisFromContract1, tokenUris[1]);
                  assert.equal(tokenUrisFromContract2, tokenUris[2]);
              });
          });

          describe("requestNft", function () {
              let mintFee: BigNumber;
              this.beforeEach(async function () {
                  mintFee = await randomIpfsNft.getMintFee();
              });

              it("Reverts with error when not enough mint fee spent", async function () {
                  await expect(
                      randomIpfsNft.requestNft()
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNFT__NeedMoreETHSent"
                  );
              });

              it("Mapps requestId with requestor", async function () {
                  await randomIpfsNft.requestNft({ value: mintFee });
                  const requestor = await randomIpfsNft.getRequestIdToSender(1);
                  assert.equal(requestor, deployer.address);
              });

              it("Emits event NftRequested", async function () {
                  const txRes = await randomIpfsNft.requestNft({
                      value: mintFee,
                  });
                  const txReceipt = await txRes.wait(1);
                  const requestId = txReceipt.events![1].args!.requestId;
                  const requestor = txReceipt.events![1].args!.requestor;
                  assert(requestId.toNumber() > 0);
                  assert.equal(requestor.toString(), deployer.address);
                  //   await expect(
                  //       randomIpfsNft.requestNft({ value: mintFee })
                  //   ).to.emit(randomIpfsNft, "NftRequested");
              });
          });

          describe("getBreedFromModdedRng", function () {
              let mintFee: BigNumber;
              this.beforeEach(async function () {
                  mintFee = await randomIpfsNft.getMintFee();
              });

              it("Retuns a Pug", async function () {
                  const breed = await randomIpfsNft.getBreedFromModdedRng(0);
                  assert.equal(breed, 0);
              });

              it("Retuns a Shiba Inu", async function () {
                  const breed = await randomIpfsNft.getBreedFromModdedRng(10);
                  assert.equal(breed, 1);
              });

              it("Retuns a St. Bernard", async function () {
                  const breed = await randomIpfsNft.getBreedFromModdedRng(40);
                  assert.equal(breed, 2);
              });

              it("Throws out of bounds error", async function () {
                  await expect(
                      randomIpfsNft.getBreedFromModdedRng(200)
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNFT__RangeOutOfBounds"
                  );
              });
          });

          describe("fulfillRandomWords", function () {
              let mintFee: BigNumber;
              this.beforeEach(async function () {
                  mintFee = await randomIpfsNft.getMintFee();
              });

              it("Increments token id, and emits event with dog breed and owner", async function () {
                  await new Promise<void>(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async function () {
                          try {
                              const tokenCounter =
                                  await randomIpfsNft.getTokenCounter();
                              assert.equal(tokenCounter.toNumber(), 1);

                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(error);
                          }
                      });
                      const tx = await randomIpfsNft.requestNft({
                          value: mintFee,
                      });
                      const txReceipt = await tx.wait(1);
                      const requestId = txReceipt.events![1].args!.requestId;
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          requestId,
                          randomIpfsNft.address
                      );
                  });
              });
          });

          describe("withdraw", function () {
              let mintFee: BigNumber;
              this.beforeEach(async function () {
                  mintFee = await randomIpfsNft.getMintFee();
              });
              it("Reverts when someone else than the deployer tries to withdraw", async function () {
                  const mintFee = await randomIpfsNft.getMintFee();
                  await randomIpfsNft.requestNft({ value: mintFee });
                  const accounts = await ethers.getSigners();
                  const attacker: SignerWithAddress = accounts[1];
                  const connectedContract = randomIpfsNft.connect(attacker);
                  await expect(connectedContract.withdraw()).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  );
              });

              it("Withdraws the contract balance to deployer", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  const connectedContract = randomIpfsNft.connect(accounts[1]);
                  await connectedContract.requestNft({ value: mintFee });

                  const contractBalaceBefore =
                      await randomIpfsNft.provider.getBalance(
                          randomIpfsNft.address
                      );
                  const deployerBalanceBefore =
                      await randomIpfsNft.provider.getBalance(deployer.address);

                  // Act
                  const txResponse = await randomIpfsNft.withdraw();
                  const txReceipt = txResponse.wait(1);
                  const { effectiveGasPrice, gasUsed } = await txReceipt;

                  const contractBalanceAfter =
                      await randomIpfsNft.provider.getBalance(
                          randomIpfsNft.address
                      );
                  const deployerBalanceAfter =
                      await randomIpfsNft.provider.getBalance(deployer.address);

                  // Assert
                  assert.equal(contractBalanceAfter.toString(), "0");
                  assert.equal(
                      deployerBalanceAfter.toString(),
                      deployerBalanceBefore
                          .add(contractBalaceBefore)
                          .sub(gasUsed.mul(effectiveGasPrice))
                          .toString()
                  );
              });
          });
      });
