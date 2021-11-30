const { ethers } = require("hardhat");

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    // Deploy OHM
    const MGNA = await ethers.getContractFactory('MgnaERC20Token');
    const mgna = await MGNA.deploy();
    console.log("MGNA:", mgna.address);
    
    // Deploy DAI
    const DAI = await ethers.getContractFactory('DAI');
    const dai = await DAI.deploy( 0 );
    console.log("DAI:", dai.address);

    // Deploy 10,000,000 mock DAI and mock Frax
    await dai.mint( deployer.address, initialMint );

