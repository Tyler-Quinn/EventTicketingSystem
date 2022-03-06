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

    modifier eventExists(string memory _eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(eventNames[eventNameHash], "Event does not exist");
        _;
    }

    modifier onlyEventOwner(string memory _eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].owner == msg.sender, "Must be event owner");
        _;
    }

    modifier onlyCheckers(string memory _eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].checkers[msg.sender] == true, "Must be event checker");
        _;
    }

    modifier ticketsAvailable(string memory _eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].ticketQuantityIssued < events[eventNameHash].ticketQuantity, "No more tickets available");
        _;
    }

    /* ===== Public Getters ===== */

    function getEventData(string memory _eventName) public view eventExists(_eventName) returns(address, uint256, uint256, uint256) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        return (events[eventNameHash].owner, events[eventNameHash].ticketPrice, events[eventNameHash].ticketQuantity, events[eventNameHash].ticketQuantityIssued);
    }

    function getTicketStatus(string memory _eventName, address _checkAddress) public view eventExists(_eventName) returns(TicketState) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        return events[eventNameHash].ticket[_checkAddress];
    }

    function getCheckerStatus(string memory _eventName, address _checkAddress) public view eventExists(_eventName) returns(bool) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        return events[eventNameHash].checkers[_checkAddress];
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

    function addChecker(string memory _eventName, address _newChecker) public eventExists(_eventName) onlyEventOwner(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].checkers[_newChecker] == false, "Address is already a checker");
        events[eventNameHash].checkers[_newChecker] = true;
        emit CheckerAdded(eventNameHash, _newChecker);
    }

    function removeChecker(string memory _eventName, address _removedChecker) public eventExists(_eventName) onlyEventOwner(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].checkers[_removedChecker] == true, "Address is already not a checker");
        delete events[eventNameHash].checkers[_removedChecker];
        emit CheckerRemoved(eventNameHash, _removedChecker);
    }

    function issueTicket(string memory _eventName, address _receiveAddress) internal eventExists(_eventName) ticketsAvailable(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].ticket[_receiveAddress] == TicketState.NONE, "Address already has ticket");
        events[eventNameHash].ticket[_receiveAddress] = TicketState.UNCLAIMED;
        events[eventNameHash].ticketQuantityIssued = events[eventNameHash].ticketQuantityIssued.add(1);
        emit UpdateTicketAmount(eventNameHash, events[eventNameHash].ticketQuantityIssued);
    }

    function burnUnclaimedTicket(string memory _eventName) public eventExists(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].ticket[msg.sender] == TicketState.UNCLAIMED, "msg.sender does not have an unclaimed ticket for this event");
        events[eventNameHash].ticket[msg.sender] = TicketState.NONE;
        events[eventNameHash].ticketQuantityIssued = events[eventNameHash].ticketQuantityIssued.sub(1);
        emit UpdateTicketAmount(eventNameHash, events[eventNameHash].ticketQuantityIssued);
    }

    // returns atendee current ticket state and turns unclaimed tickets into claimed tickets
    function checkInTicket(string memory _eventName, address _atendeeAddress) public eventExists(_eventName) onlyCheckers(_eventName) returns(TicketState) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        TicketState state = events[eventNameHash].ticket[_atendeeAddress];
        if (state == TicketState.UNCLAIMED) {
            events[eventNameHash].ticket[_atendeeAddress] = TicketState.CLAIMED;
        }
        emit TicketChecked(eventNameHash, _atendeeAddress, state, events[eventNameHash].ticket[_atendeeAddress]);
        return state;
    }

    // can only send unclaimed tickets to other addresses
    function transferUnclaimedTicket(string memory _eventName, address _receiveAddress) public eventExists(_eventName) {
        bytes32 eventNameHash = keccak256(abi.encodePacked(_eventName));
        require(events[eventNameHash].ticket[msg.sender] == TicketState.UNCLAIMED, "msg.sender does not have an unclaimed ticket for this event");
        require(events[eventNameHash].ticket[_receiveAddress] == TicketState.NONE, "_receiveAddress already has a ticket");
        events[eventNameHash].ticket[_receiveAddress] = events[eventNameHash].ticket[msg.sender];
        delete events[eventNameHash].ticket[msg.sender];
        emit TicketTransferred(eventNameHash, msg.sender, _receiveAddress);
    }

}