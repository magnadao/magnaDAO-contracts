/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
    networks: {
        hardhat: {
            forking: {
                url: process.env.AVAX_NET,
            }
        },
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
            gas: "auto"
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.7.5",
            },
            {
                version: "0.8.0",
            }
        ]
    }
};
