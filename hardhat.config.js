require("@nomicfoundation/hardhat-toolbox");
try { require("dotenv").config(); } catch (_) {}

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";

const sepoliaConfig = {
  url: SEPOLIA_RPC_URL,
  ...(PRIVATE_KEY && PRIVATE_KEY.length >= 64 ? { accounts: [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`] } : {}),
};

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: sepoliaConfig,
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
};
