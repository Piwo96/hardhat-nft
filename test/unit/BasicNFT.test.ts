import { assert, expect } from "chai";
import { network, ethers, deployments } from "hardhat";
import { BigNumber } from "ethers";
import { BasicNFT } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", function () {
          let basicNft: BasicNFT;
          let deployer: SignerWithAddress;
          this.beforeEach(async function () {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["basicNft"]);
              basicNft = await ethers.getContract("BasicNFT", deployer);
          });

          describe("constructor", function () {
              it("Has a name", async function () {
                  const nameFromContract = await basicNft.name();
                  assert.equal(nameFromContract, "Dogie");
              });

              it("Has a symbol", async function () {
                  const symbolFromContract = await basicNft.symbol();
                  assert.equal(symbolFromContract, "DOG");
              });

              it("Has a uri", async function () {
                  const uri =
                      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
                  const uriFromContract = await basicNft.tokenURI(0);
                  assert.equal(uri, uriFromContract);
              });

              it("Has a token counter", async function () {
                  const counter = await basicNft.getTokenCounter();
                  assert.equal(counter.toString(), "0");
              });
          });

          describe("mintNft", function () {
              it("Increments token counter", async function () {
                  const counterBeforeMint = await basicNft.getTokenCounter();
                  await basicNft.mintNft();
                  const counterAfterMint = await basicNft.getTokenCounter();
                  assert.equal(
                      counterBeforeMint.add(BigNumber.from("1")).toString(),
                      counterAfterMint.toString()
                  );
              });

              it("Deployer has a balance of 0 when not minted", async function () {
                  const balance = await basicNft.balanceOf(deployer.address);
                  assert.equal(balance.toString(), "0");
              });

              it("Deployer has a balance of 1 after mint", async function () {
                  await basicNft.mintNft();
                  const balance = await basicNft.balanceOf(deployer.address);
                  assert.equal(balance.toString(), "1");
              });
          });
      });
