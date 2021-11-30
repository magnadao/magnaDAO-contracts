const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";
    const CVX = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
    const Treasury = "0x31F8Cc382c9898b273eff4e0b7626a6987C846E8";
    const DAO = "0x245cc372C84B3645Bf0Ffe6538620B04a217988B";
    const PRICE_FEED = "0x976B3D034E162d8bD72D6b9C989d545b839003b0";
    const PRICE_FEED_TESTNET = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA";
    
    const policy = "0x0cf30dc0d48604A301dF8010cdc028C055336b2E"

    // Get contract factory for Eth bond
    const EthBond = await ethers.getContractFactory('MgnaBondDepository');

    // Deploy CVX bond
    const ethBond = await EthBond.deploy(OHM, CVX, Treasury, DAO, PRICE_FEED_TESTNET);

    await ethBond.pushManagement(policy);

    console.log("Bond: " + ethBond.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
