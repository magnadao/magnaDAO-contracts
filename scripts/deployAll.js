// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

async function main() {
    // Util functions
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // Get signers
    const [deployer, MockDAO] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);
    console.log('MockDAO address: ' + MockDAO.address);

    // Mannually update nonce 
    const baseNonce = async () => await deployer.getTransactionCount();
    const nonceOffset = 0;
    function getNonce() {
          return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
    }

    console.log("HIT 1")
    // Initial staking index
    const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = '8961000';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Large number for approval for Frax and DAI
    const largeApproval = '100000000000000000000000000000000';

    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';

    // DAI bond BCV
    const daiBondBCV = '369';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Min bond price
    const minBondPrice = '50000';

    // Max bond payout
    const maxBondPayout = '50';

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    // Deploy OHM
    const MGNA = await ethers.getContractFactory('MgnaERC20Token');
    const mgna = await MGNA.deploy();
    await mgna.deployed();

    // Deploy DAI
    const DAI = await ethers.getContractFactory('DAI');
    const dai = await DAI.deploy( 0 );
    await dai.deployed();

    // Deploy 10,000,000 mock DAI and mock Frax
    const mintDai = await dai.mint( deployer.address, initialMint );
    await mintDai.wait();

    // Deploy treasury
    //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('MockMagnaTreasury'); 
    const treasury = await Treasury.deploy(mgna.address, dai.address, 0 );
    await treasury.deployed();

    // Deploy bonding calc
    const MagnaBondingCalculator = await ethers.getContractFactory('MagnaBondingCalculator');
    const magnaBondingCalculator = await MagnaBondingCalculator.deploy( mgna.address );
    await magnaBondingCalculator.deployed();

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, mgna.address, epochLengthInBlocks, firstEpochBlock);
    await distributor.deployed();

    // Deploy sOHM
    const xMGNA = await ethers.getContractFactory('xMagna');
    const xmgna = await xMGNA.deploy();
    await xmgna.deployed();

    // Deploy Staking
    const Staking = await ethers.getContractFactory('MagnaStaking');
    const staking = await Staking.deploy( mgna.address, xmgna.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock);
    await staking.deployed();

    // Deploy staking warmpup
    const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmpup.deploy(staking.address, xmgna.address);
    await staking.deployed();

    console.log("HIT 2");
    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(staking.address, mgna.address);
    await stakingHelper.deployed();

    console.log("HIT 3");
    // Deploy DAI bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const DAIBond = await ethers.getContractFactory('MockOlympusBondDepository');
    const daiBond = await DAIBond.deploy(mgna.address, dai.address, treasury.address, MockDAO.address, zeroAddress);
    await daiBond.deployed();

    console.log("HIT8")

    // queue and toggle DAI and Frax bond reserve depositor
    const treasuryQueue = await treasury.queue('0', daiBond.address);
    await treasuryQueue.wait();
    const treasuryToggle = await treasury.toggle('0', daiBond.address, zeroAddress);
    await treasuryToggle.wait();

    console.log("HIT9")
    // Set DAI and Frax bond terms
    const initDaiBond = await daiBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    await initDaiBond.wait();

    // Set staking for DAI and Frax bond
    const setStakeDAI = await daiBond.setStaking(staking.address, stakingHelper.address);
    await setStakeDAI.wait();

    console.log("HIT10")
    // Initialize sOHM and set the index
    const xmgnaInit = await xmgna.initialize(staking.address);
    const xmgnaSetIndex = await xmgna.setIndex(initialIndex);
    await xmgnaInit.wait();
    await xmgnaSetIndex.wait();

    // set distributor contract and warmup contract
    const setContractStake0 = await staking.setContract('0', distributor.address);
    await setContractStake0.wait();
    const setContractStake1 = await staking.setContract('1', stakingWarmup.address);
    await setContractStake1.wait();

    console.log("HIT4")
    // Set treasury for OHM token
    const mgnaSetVault = await mgna.setVault(treasury.address);
    await mgnaSetVault.wait();

    // Add staking contract as distributor recipient
    const addDistributor = await distributor.addRecipient(staking.address, initialRewardRate);
    await addDistributor.wait();

    // queue and toggle reward manager
    const treasuryQueue1 = await treasury.queue('8', distributor.address);
    await treasuryQueue1.wait();
    const treasuryToggle1 = await treasury.toggle('8', distributor.address, zeroAddress);
    await treasuryToggle1.wait();
    
    // queue and toggle deployer reserve depositor
    const treasuryQueue2 = await treasury.queue('0', deployer.address);
    await treasuryQueue2.wait();
    const treasuryToggle2 = await treasury.toggle('0', deployer.address, zeroAddress);
    await treasuryToggle2.wait();

    // queue and toggle liquidity depositor
    const treasuryQueue3 = await treasury.queue('4', deployer.address, );
    await treasuryQueue3.wait();
    const treasuryToggle3 = await treasury.toggle('4', deployer.address, zeroAddress);
    await treasuryToggle3.wait();

    console.log("HIT5")
    // Approve the treasury to spend DAI
    const approveDai1 = await dai.approve(treasury.address, largeApproval );
    await approveDai1.wait();

    // Approve dai bonds to spend deployer's DAI
    const approveDai2 = await dai.approve(daiBond.address, largeApproval );
    await approveDai2.wait();

    console.log("HIT1")
    // Approve staking and staking helper contact to spend deployer's OHM
    const approveMgna1 = await mgna.approve(staking.address, largeApproval);
    await approveMgna1.wait();
    const approveMgna2 = await mgna.approve(stakingHelper.address, largeApproval);
    await approveMgna2.wait();

    // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    const treasuryDeposit = await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');
    await treasuryDeposit.wait();

    // Stake OHM through helper
    const stake = await stakingHelper.stake('100000000000', MockDAO.address);
    await stake.wait();
    
    console.log("HIT6")
    // Bond 1,000 OHM and Frax in each of their bonds
    const daiBondDeposit = await daiBond.deposit('1000000000000000000000', '60000', deployer.address );
    await daiBondDeposit.wait();

    console.log( "MGNA: " + mgna.address );
    console.log( "DAI: " + dai.address );
    console.log( "Treasury: " + treasury.address );
    console.log( "Calc: " + magnaBondingCalculator.address );
    console.log( "Staking: " + staking.address );
    console.log( "xMGNA: " + xmgna.address );
    console.log( "Distributor " + distributor.address);
    console.log( "Staking Wawrmup " + stakingWarmup.address);
    console.log( "Staking Helper " + stakingHelper.address);
    console.log("DAI Bond: " + daiBond.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
