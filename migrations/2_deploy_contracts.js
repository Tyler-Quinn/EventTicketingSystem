const MockERC20 = artifacts.require('MockERC20.sol');
const TicketSales = artifacts.require('TicketSales.sol');

module.exports = async function (deployer, network, addresses) {

    if(network === 'develop') {
        await deployer.deploy(MockERC20, 'DAIStablecoin', 'DAI');
        const dai = await MockERC20.deployed();
        await dai.mint(addresses[0], web3.utils.toWei('10000'));
        await dai.mint(addresses[1], web3.utils.toWei('10000'));
        await dai.mint(addresses[2], web3.utils.toWei('10000'));
        await dai.mint(addresses[3], web3.utils.toWei('10000'));
        await dai.mint(addresses[4], web3.utils.toWei('10000'));

        await deployer.deploy(TicketSales, dai.address);
    } else {
        const DAI_ADDRESS = '';
        await deployer.deploy(TicketSales, dai.address);
    }

};
