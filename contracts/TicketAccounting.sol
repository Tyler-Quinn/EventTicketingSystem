//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract TicketAccounting {
    using SafeMath for uint256;

    enum TicketState{ NONE, UNCLAIMED, CLAIMED }

    struct Event {
        address owner;
        uint256 ticketPrice;
        uint256 ticketQuantity;
        uint256 ticketQuantityIssued;
        mapping (address => bool) checkers;
        mapping (address => TicketState) ticket;
    }

    /* ===== Events ===== */

    event NewEvent(bytes32 indexed _eventNameHash, address indexed _owner, uint256 _ticketPrice, uint256 _ticketQuantity);
    event CheckerAdded(bytes32 indexed _eventNameHash, address indexed _checkerAddress);
    event CheckerRemoved(bytes32 indexed _eventNameHash, address indexed _checkerAddress);
    event TicketChecked(bytes32 indexed _eventNameHash, address indexed _atendeeAddress, TicketState _startState, TicketState _endState);
    event TicketTransferred(bytes32 indexed _eventNameHash, address indexed _sendAddress, address indexed _receiveAddress);
    event UpdateTicketAmount(bytes32 indexed _eventNameHash, uint256 _ticketQuantityIssued);

    /* ===== State ===== */

    mapping (bytes32 => Event) public events;
    mapping (bytes32 => bool) internal eventNames;

    /* ===== Modifiers ===== */

    modifier eventExists(bytes32 _eventNameHash) {
        require(eventNames[_eventNameHash], "Event does not exist");
        _;
    }

    modifier onlyEventOwner(bytes32 _eventNameHash) {
        require(events[_eventNameHash].owner == msg.sender, "Must be event owner");
        _;
    }

    modifier onlyCheckers(bytes32 _eventNameHash) {
        require(events[_eventNameHash].checkers[msg.sender] == true, "Must be event checker");
        _;
    }

    modifier ticketsAvailable(bytes32 _eventNameHash) {
        require(events[_eventNameHash].ticketQuantityIssued < events[_eventNameHash].ticketQuantity, "No more tickets available");
        _;
    }

    /* ===== Public Getters ===== */

    function getEventData(bytes32 _eventNameHash) public view eventExists(_eventNameHash) returns(address, uint256, uint256, uint256) {
        return (events[_eventNameHash].owner, events[_eventNameHash].ticketPrice, events[_eventNameHash].ticketQuantity, events[_eventNameHash].ticketQuantityIssued);
    }

    function getTicketStatus(bytes32 _eventNameHash, address _checkAddress) public view eventExists(_eventNameHash) returns(TicketState) {
        return events[_eventNameHash].ticket[_checkAddress];
    }

    function getCheckerStatus(bytes32 _eventNameHash, address _checkAddress) public view eventExists(_eventNameHash) returns(bool) {
        return events[_eventNameHash].checkers[_checkAddress];
    }

    /* ===== Functions ===== */

    function createEvent(string memory _eventName, uint256 _ticketPrice, uint256 _ticketQuantity) public {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(!eventNames[eventNameHash], "Event already exists");
        require(_ticketQuantity > 0, "Ticket quantity must be greater than zero");
        eventNames[eventNameHash] = true;
        events[eventNameHash].owner = msg.sender;
        events[eventNameHash].ticketPrice = _ticketPrice;
        events[eventNameHash].ticketQuantity = _ticketQuantity;
        events[eventNameHash].checkers[msg.sender] = true;
        emit NewEvent(eventNameHash, msg.sender, _ticketPrice, _ticketQuantity);
    }

    function addChecker(bytes32 _eventNameHash, address _newChecker) public eventExists(_eventNameHash) onlyEventOwner(_eventNameHash) {
        require(events[_eventNameHash].checkers[_newChecker] == false, "Address is already a checker");
        events[_eventNameHash].checkers[_newChecker] = true;
        emit CheckerAdded(_eventNameHash, _newChecker);
    }

    function removeChecker(bytes32 _eventNameHash, address _removedChecker) public eventExists(_eventNameHash) onlyEventOwner(_eventNameHash) {
        require(events[_eventNameHash].checkers[_removedChecker] == true, "Address is already not a checker");
        delete events[_eventNameHash].checkers[_removedChecker];
        emit CheckerRemoved(_eventNameHash, _removedChecker);
    }

    function issueTicket(bytes32 _eventNameHash, address _receiveAddress) internal eventExists(_eventNameHash) ticketsAvailable(_eventNameHash) {
        require(events[_eventNameHash].ticket[_receiveAddress] == TicketState.NONE, "Address already has ticket");
        events[_eventNameHash].ticket[_receiveAddress] = TicketState.UNCLAIMED;
        events[_eventNameHash].ticketQuantityIssued = events[_eventNameHash].ticketQuantityIssued.add(1);
        emit UpdateTicketAmount(_eventNameHash, events[_eventNameHash].ticketQuantityIssued);
    }

    function burnUnclaimedTicket(bytes32 _eventNameHash) public eventExists(_eventNameHash) {
        require(events[_eventNameHash].ticket[msg.sender] == TicketState.UNCLAIMED, "msg.sender does not have an unclaimed ticket for this event");
        events[_eventNameHash].ticket[msg.sender] = TicketState.NONE;
        events[_eventNameHash].ticketQuantityIssued = events[_eventNameHash].ticketQuantityIssued.sub(1);
        emit UpdateTicketAmount(_eventNameHash, events[_eventNameHash].ticketQuantityIssued);
    }

    // returns atendee current ticket state and turns unclaimed tickets into claimed tickets
    function checkInTicket(bytes32 _eventNameHash, address _atendeeAddress) public eventExists(_eventNameHash) onlyCheckers(_eventNameHash) returns(TicketState) {
        TicketState state = events[_eventNameHash].ticket[_atendeeAddress];
        if (state == TicketState.UNCLAIMED) {
            events[_eventNameHash].ticket[_atendeeAddress] = TicketState.CLAIMED;
        }
        emit TicketChecked(_eventNameHash, _atendeeAddress, state, events[_eventNameHash].ticket[_atendeeAddress]);
        return state;
    }

    // can only send unclaimed tickets to other addresses
    function transferUnclaimedTicket(bytes32 _eventNameHash, address _receiveAddress) public eventExists(_eventNameHash) {
        require(events[_eventNameHash].ticket[msg.sender] == TicketState.UNCLAIMED, "msg.sender does not have an unclaimed ticket for this event");
        require(events[_eventNameHash].ticket[_receiveAddress] == TicketState.NONE, "_receiveAddress already has a ticket");
        events[_eventNameHash].ticket[_receiveAddress] = events[_eventNameHash].ticket[msg.sender];
        delete events[_eventNameHash].ticket[msg.sender];
        emit TicketTransferred(_eventNameHash, msg.sender, _receiveAddress);
    }
}