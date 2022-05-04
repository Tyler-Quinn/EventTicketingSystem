//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TicketAccounting.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TicketSales is TicketAccounting, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ===== State ===== */

    IERC20 public dai;
    mapping (address => mapping (bytes32 => uint256)) public balances;

    /* ===== Constructor ===== */

    constructor(address daiAddress) {
        dai = IERC20(daiAddress);
    }

    /* ===== Events ===== */

    event TicketBought(bytes32 indexed _eventNameHash, address indexed _buyer, address indexed _receiver);
    event BalanceClaimed(address indexed _receiver, bytes32 _asset, uint256 _amount);

    /* ===== Functions ===== */

    // Owner of the Event can send tickets for free
    function ownerIssueTicket(bytes32 _eventNameHash, address _receiveAddress) external eventExists(_eventNameHash) ticketsAvailable(_eventNameHash) onlyEventOwner(_eventNameHash) {
        issueTicket(_eventNameHash, _receiveAddress);
        emit TicketBought(_eventNameHash, msg.sender, _receiveAddress);
    }

    // Purchase a ticket with DAI
    function buyTicketDai(bytes32 _eventNameHash, address _receiveAddress) external eventExists(_eventNameHash) ticketsAvailable(_eventNameHash) {
        require(dai.balanceOf(msg.sender) >= events[_eventNameHash].ticketPrice, "Does not have enough DAI");
        issueTicket(_eventNameHash, _receiveAddress);
        balances[events[_eventNameHash].owner]["DAI"] = balances[events[_eventNameHash].owner]["DAI"].add(events[_eventNameHash].ticketPrice);
        dai.transferFrom(msg.sender, address(this), events[_eventNameHash].ticketPrice);
        emit TicketBought(_eventNameHash, msg.sender, _receiveAddress);
    }

    function claimBalance(bytes32 _asset) external {
        uint256 amount = balances[msg.sender][_asset];
        require(amount > 0, "No balance to claim");
        balances[msg.sender][_asset] = 0;
        dai.transfer(msg.sender, amount);
        emit BalanceClaimed(msg.sender, _asset, amount);
    }

}