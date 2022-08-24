import { ethers } from "hardhat";

interface NetworkConfigInfo {
    [id: number]: NetworkConfigItem;
}

interface NetworkConfigItem {
    blockConfirmations: number;
    VRFCoordinatorAddress?: string;
    gasHash?: string;
    callbackGasLimit?: string;
    subscriptionId?: string;
}

export const networkConfig: NetworkConfigInfo = {
    4: {
        blockConfirmations: 6,
        VRFCoordinatorAddress: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        gasHash:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        subscriptionId: "",
    },
    31337: {
        blockConfirmations: 1,
        gasHash:
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
    },
};

export const SUB_FUND_AMOUNT = ethers.utils.parseEther("0.5");

export const developmentChains = ["hardhat", "localhost"];
