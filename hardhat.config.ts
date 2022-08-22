import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";
import "hardhat-gas-reporter";

const PRIVATE_KEY = process.env.PRIVATE_KEY! || "0x0";
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2! || "0x0";
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL! || "https://eth";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY! || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY! || "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.7" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            chainId: 4,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
        },
        localhost: {
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        noColors: true,
        outputFile: "gas-report.txt",
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    mocha: {
        timeout: 300000,
    },
};

export default config;
