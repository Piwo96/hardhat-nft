interface NetworkConfigInfo {
    [id: number]: NetworkConfigItem;
}

interface NetworkConfigItem {
    blockConfirmations: number;
}

export const networkConfig: NetworkConfigInfo = {
    4: {
        blockConfirmations: 6,
    },
    31337: {
        blockConfirmations: 1,
    },
};

export const developmentChains = ["hardhat", "localhost"];
