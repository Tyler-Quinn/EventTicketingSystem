const MockERC20 = artifacts.require('MockERC20.sol');
const TicketSales = artifacts.require('TicketSales.sol');

const BN = require('bn.js');

contract("TicketSales", accounts => {
    let ticketSales = null;
    let dai = null;
    before(async () => {
      ticketSales = await TicketSales.deployed();
      dai = await MockERC20.deployed();
    });

    // Initial tests

    it('Should deploy TicketSales contract properly', async () => {
        assert(ticketSales.address != '');
    });

    it('Should deploy MockDAI contract properly', async () => {
        assert(dai.address != '');
    });

    it('10000 dai should be minted at deployment', async () => {
        assert(JSON.stringify(await dai.balanceOf(accounts[0])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[1])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[2])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[3])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[4])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
    });

    // Test createEvent function

    it('Cannot create an Event with zero ticket supply', async () => {
        try {
            await ticketSales.createEvent('TestEvent0', web3.utils.toWei('40'), 0, {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Ticket quantity must be greater than zero'));
            return;
        }
        assert(false);
    });

    it('Create an Event', async () => {
        try {
            await ticketSales.createEvent('TestEvent0', web3.utils.toWei('40'), 3, {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        let result = await ticketSales.getEventData('TestEvent0');
        assert(result[0] == accounts[0]);
        assert(JSON.stringify(result[1]) == JSON.stringify(web3.utils.toBN(web3.utils.toWei('40'))));
        assert(JSON.stringify(result[2]) == JSON.stringify('3'));
        assert(JSON.stringify(result[3]) == JSON.stringify('0'));
        result = await ticketSales.getCheckerStatus('TestEvent0', accounts[0]);
        assert(result);
    });

    it('Cannot start an Event with the same name as an existing event', async () => {
        try {
            await ticketSales.createEvent('TestEvent0', web3.utils.toWei('40'), 3, {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Event already exists'));
            return;
        }
        assert(false);
    });

    // Test addChecker function

    it('Cannot add a checker for an Event that does not exist', async () => {
        try {
            await ticketSales.addChecker('NonexistentEvent', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot add a checker if not the owner of the Event', async () => {
        try {
            await ticketSales.addChecker('TestEvent0', accounts[2], {from: accounts[1]});
        } catch(e) {
            assert(e.message.includes('Must be event owner'));
            return;
        }
        assert(false);
    });

    it('Add checker', async () => {
        let result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(!result);
        try {
            await ticketSales.addChecker('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(result);
    });

    it('Cannot add a checker that is already a checker', async () => {
        try {
            await ticketSales.addChecker('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Address is already a checker'));
            return;
        }
        assert(false);
    });

    // test removeChecker function

    it('Cannot call removeChecker for an Event that does not exist', async () => {
        try {
            await ticketSales.removeChecker('NonexistentEvent', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot call removeChecker if not the owner of the Event', async () => {
        try {
            await ticketSales.removeChecker('TestEvent0', accounts[2], {from: accounts[1]});
        } catch(e) {
            assert(e.message.includes('Must be event owner'));
            return;
        }
        assert(false);
    });

    it('Cannot remove a checker that is not a checker', async () => {
        try {
            await ticketSales.removeChecker('TestEvent0', accounts[2], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Address is already not a checker'));
            return;
        }
        assert(false);
    });

    it('Remove checker', async () => {
        let result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(result);
        try {
            await ticketSales.removeChecker('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(!result);
    });

    it('Re-add checker, we want to use account[1] as the checker', async () => {
        let result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(!result);
        try {
            await ticketSales.addChecker('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getCheckerStatus('TestEvent0', accounts[1]);
        assert(result);
    });

    // Test ownerIssueTicket function

    it('Cannot call ownerIssueTicket to an Event that does not exist', async () => {
        try {
            await ticketSales.ownerIssueTicket('NonexistentEvent', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot call ownerIssueTicket if not the Event owner', async () => {
        try {
            await ticketSales.ownerIssueTicket('TestEvent0', accounts[1], {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('Must be event owner'));
            return;
        }
        assert(false);
    });

    it('Event owner sends ticket to accounts[1]', async () => {
        let result = await ticketSales.getTicketStatus('TestEvent0', accounts[1]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify(web3.utils.toBN(0)));
        try {
            await ticketSales.ownerIssueTicket('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(false);
        }
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[1]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify(web3.utils.toBN(1)));
    });

    // Test issueTicket function using ownerIssueTicket

    it('issueTicket cannot issue to an address that already has a ticket', async () => {
        try {
            await ticketSales.ownerIssueTicket('TestEvent0', accounts[1], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('Address already has ticket'));
            return;
        }
        assert(false);
    });

    // Test buyTicketDai

    it('Cannot call buyTicketDai to an Event that does not exist', async () => {
        try {
            await ticketSales.buyTicketDai('NonexistentEvent', accounts[2], {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Must have enough DAI to buy ticket, make a new Event with a high price', async () => {
        try {
            await ticketSales.createEvent('TestEvent1', web3.utils.toWei('800000'), 3, {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        try {
            await ticketSales.buyTicketDai('TestEvent1', accounts[2], {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('Does not have enough DAI'));
            return;
        }
    });

    it('Approve DAI', async () => {
        try {
            await dai.approve(ticketSales.address, web3.utils.toWei('100000'), {from: accounts[2]});
        } catch(e) {
            console.log(e.message);
            assert(false);
            return;
        }
    });

    it('Purchase ticket with DAI', async () => {
        assert(JSON.stringify(await dai.balanceOf(accounts[2])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify(web3.utils.toBN(1)));
        result = await ticketSales.balances(accounts[0], web3.utils.asciiToHex('DAI'));
        assert(await JSON.stringify(result) == JSON.stringify(web3.utils.toBN(web3.utils.toWei('0'))));
        try {
            await ticketSales.buyTicketDai('TestEvent0', accounts[2], {from: accounts[2]});
        } catch(e) {
            console.log(e.message);
            assert(false);
            return;
        }
        assert(JSON.stringify(await dai.balanceOf(accounts[2])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('9960'))));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify(web3.utils.toBN(2)));
        result = await ticketSales.balances(accounts[0], web3.utils.asciiToHex('DAI'));
        assert(await JSON.stringify(result) == JSON.stringify(web3.utils.toBN(web3.utils.toWei('40'))));
    });

    // Test transferUnclaimedTicket

    it('Cannot call transferUnclaimedTicket to an Event that does not exist', async () => {
        try {
            await ticketSales.transferUnclaimedTicket('NonexistentEvent', accounts[3], {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot call transferUnclaimedTicket if msg.sender does not have an unclaimed ticket', async () => {
        try {
            await ticketSales.transferUnclaimedTicket('TestEvent0', accounts[3], {from: accounts[4]});
        } catch(e) {
            assert(e.message.includes('msg.sender does not have an unclaimed ticket for this event'));
            return;
        }
        assert(false);
    });

    it('Cannot call transferUnclaimedTicket if the receive address already has a ticket', async () => {
        try {
            await ticketSales.transferUnclaimedTicket('TestEvent0', accounts[2], {from: accounts[1]});
        } catch(e) {
            assert(e.message.includes('_receiveAddress already has a ticket'));
            return;
        }
        assert(false);
    });

    it('Transfer ticket with transferUnclaimedTicket', async () => {
        let result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[3]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify('2'));
        try {
            await ticketSales.transferUnclaimedTicket('TestEvent0', accounts[3], {from: accounts[2]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[3]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify('2'));
    });

    // Test burnUnclaimedTicket

    it('Cannot call burnUnclaimedTicket to an Event that does not exist', async () => {
        try {
            await ticketSales.burnUnclaimedTicket('NonexistentEvent', {from: accounts[3]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot call burnUnclaimedTicket if msg.sender does not have an unclaimed ticket', async () => {
        try {
            await ticketSales.burnUnclaimedTicket('TestEvent0', {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('msg.sender does not have an unclaimed ticket for this event'));
            return;
        }
        assert(false);
    });

    it('accounts[3] burns unclaimed ticket successfully', async () => {
        let result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify('2'));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[3]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        try {
            await ticketSales.burnUnclaimedTicket('TestEvent0', {from: accounts[3]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify('1'));
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[3]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
    });

    // Bring ticket quantity issued to the max

    it('Bring ticket quantity issued to the max', async () => {
        try {
            await ticketSales.buyTicketDai('TestEvent0', accounts[2], {from: accounts[2]});
        } catch(e) {
            assert(false);
            return;
        }
        try {
            await dai.approve(ticketSales.address, web3.utils.toWei('100000'), {from: accounts[3]});
        } catch(e) {
            assert(false);
            return;
        }
        try {
            await ticketSales.buyTicketDai('TestEvent0', accounts[3], {from: accounts[3]});
        } catch(e) {
            assert(false);
            return;
        }
        let result = await ticketSales.getEventData('TestEvent0');
        assert(JSON.stringify(result[3]) == JSON.stringify('3'));
    });

    // Test all functions with ticket quantity issued related requirements

    it('Cannot call ownerIssueTicket if there are no more tickets available', async () => {
        try {
            await ticketSales.ownerIssueTicket('TestEvent0', accounts[4], {from: accounts[0]});
        } catch(e) {
            assert(e.message.includes('No more tickets available'));
            return;
        }
    });

    it('Cannot call buyTicketDai if there are no more tickets available', async () => {
        try {
            await dai.approve(ticketSales.address, web3.utils.toWei('100000'), {from: accounts[4]});
        } catch(e) {
            assert(false);
            return;
        }
        try {
            await ticketSales.buyTicketDai('TestEvent0', accounts[4], {from: accounts[4]});
        } catch(e) {
            assert(e.message.includes('No more tickets available'));
            return;
        }
    });

    // Test checkInTicket

    it('Cannot call checkInTicket to an Event that does not exist', async () => {
        try {
            await ticketSales.checkInTicket('NonexistentEvent', accounts[1], {from: accounts[1]});
        } catch(e) {
            assert(e.message.includes('Event does not exist'));
            return;
        }
        assert(false);
    });

    it('Cannot call checkInTicket if msg.sender is not a checker for this Event', async () => {
        try {
            await ticketSales.checkInTicket('TestEvent0', accounts[1], {from: accounts[2]});
        } catch(e) {
            assert(e.message.includes('Must be event checker'));
            return;
        }
        assert(false);
    });

    it('Check in unclaimed ticket, unclaimed status changes to claimed', async () => {
        let result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(1)));
        try {
            await ticketSales.checkInTicket('TestEvent0', accounts[2], {from: accounts[1]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(2)));
    });

    it('Check status of claimed ticket with checkInTicket, status does not change', async () => {
        let result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(2)));
        try {
            await ticketSales.checkInTicket('TestEvent0', accounts[2], {from: accounts[1]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[2]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(2)));
    });

    it('Check status of an address without a ticket with checkInTicket, status does not change', async () => {
        let result = await ticketSales.getTicketStatus('TestEvent0', accounts[6]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
        try {
            await ticketSales.checkInTicket('TestEvent0', accounts[6], {from: accounts[1]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.getTicketStatus('TestEvent0', accounts[6]);
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(0)));
    });

    // Test claimBalance

    it('Must have a positive balance to claim tokens', async () => {
        try {
            await ticketSales.claimBalance(web3.utils.asciiToHex('DAI'), {from: accounts[1]});
        } catch(e) {
            assert(e.message.includes('No balance to claim'));
            return;
        }
        assert(false);
    });

    it('Claim tokens', async () => {
        let result = await ticketSales.balances(accounts[0], web3.utils.asciiToHex('DAI'), {from: accounts[0]});
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(web3.utils.toWei('120'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[0])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10000'))));
        try {
            await ticketSales.claimBalance(web3.utils.asciiToHex('DAI'), {from: accounts[0]});
        } catch(e) {
            assert(false);
            return;
        }
        result = await ticketSales.balances(accounts[0], web3.utils.asciiToHex('DAI'), {from: accounts[0]});
        assert(JSON.stringify(result) == JSON.stringify(web3.utils.toBN(web3.utils.toWei('0'))));
        assert(JSON.stringify(await dai.balanceOf(accounts[0])) == JSON.stringify(await web3.utils.toBN(web3.utils.toWei('10120'))));
    });

});