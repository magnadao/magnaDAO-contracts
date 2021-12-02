// Deployment of xWMGNA
async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const xMGNA_ADDRESS = "0x0d747aBc44954B77b36D3c4C7DC73806dD5130E0";
    // Deploy xWMGNA
    const xWMGNA = await ethers.getContractFactory('xWMGNA');
    const xWmgna = await xWMGNA.deploy(xMGNA_ADDRESS);
    console.log("xWMGNA:", xWmgna.address);
    
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
