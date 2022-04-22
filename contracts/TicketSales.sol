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
    function ownerIssueTicket(string memory _eventName, address _receiveAddress) external eventExists(_eventName) ticketsAvailable(_eventName) onlyEventOwner(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        issueTicket(_eventName, _receiveAddress);
        emit TicketBought(eventNameHash, msg.sender, _receiveAddress);
    }

    // Purchase a ticket with DAI
    function buyTicketDai(string memory _eventName, address _receiveAddress) external eventExists(_eventName) ticketsAvailable(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(dai.balanceOf(msg.sender) >= events[eventNameHash].ticketPrice, "Does not have enough DAI");
        issueTicket(_eventName, _receiveAddress);
        balances[events[eventNameHash].owner]["DAI"] = balances[events[eventNameHash].owner]["DAI"].add(events[eventNameHash].ticketPrice);
        dai.transferFrom(msg.sender, address(this), events[eventNameHash].ticketPrice);
        emit TicketBought(eventNameHash, msg.sender, _receiveAddress);
    }

    function claimBalance(bytes32 _asset) external {
        uint256 amount = balances[msg.sender][_asset];
        require(amount > 0, "No balance to claim");
        balances[msg.sender][_asset] = 0;
        dai.transfer(msg.sender, amount);
        emit BalanceClaimed(msg.sender, _asset, amount);
    }

}