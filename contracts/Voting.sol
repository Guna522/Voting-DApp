// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract Voting {
    event Debug(address indexed voter, uint256 voterId, bytes32 uniqueId);

    struct Candidate {
        uint256 id;
        string name;
        uint256 numberOfVotes;
    }

    struct Voter {
        string name;
        string voterId;
        bytes32 uniqueId;
        string phoneNumber;
        string imageUrl;
        uint8 age;
        string gender;
        bool registered;
        bool hasVoted;
    }

    event ElectionStarted(uint256 votingEnd);
    event CandidateAdded(string name);
    event Voted(address voter, uint256 candidateId);
    event VoterRegistered(address voter, string name, string voterId, bytes32 uniqueId, string phoneNumber, string imageUrl, uint8 age, string gender);

    Candidate[] public candidates;
    address public owner;
    mapping(address => Voter) public voterDetails;
    mapping(bytes32 => address) public uniqueIdToAddress;
    address[] public listOfVoters;
    uint256 public votingStart;
    uint256 public votingEnd;
    bool public electionStarted;
    uint8 public constant MINIMUM_AGE = 18;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not authorized to perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startElection(uint256 _votingDuration) public onlyOwner {
        require(!electionStarted, "Election is currently ongoing");
        require(candidates.length > 0, "No candidates available");
        resetAllVoterStatus();
        electionStarted = true;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + _votingDuration;
        emit ElectionStarted(votingEnd);
    }

    function registerVoter(
        string memory _name,
        string memory _voterId,
        bytes32 _uniqueId,
        string memory _phoneNumber,
        string memory _imageUrl,
        uint8 _age,
        string memory _gender
    ) public {
        require(!voterDetails[msg.sender].registered, "You are already registered");
        require(uniqueIdToAddress[_uniqueId] == address(0), "Voter ID already exists");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_phoneNumber).length > 0, "Phone number cannot be empty");
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
        require(_age >= MINIMUM_AGE, "Voter must be at least 18 years old");
        require(
            keccak256(abi.encodePacked(_gender)) == keccak256(abi.encodePacked("Male")) || 
            keccak256(abi.encodePacked(_gender)) == keccak256(abi.encodePacked("Female")),
            "Gender must be either Male or Female"
        );

        voterDetails[msg.sender] = Voter({
            name: _name,
            voterId: _voterId,
            uniqueId: _uniqueId,
            phoneNumber: _phoneNumber,
            imageUrl: _imageUrl,
            age: _age,
            gender: _gender,
            registered: true,
            hasVoted: false
        });

        uniqueIdToAddress[_uniqueId] = msg.sender;
        listOfVoters.push(msg.sender);

        emit VoterRegistered(msg.sender, _name, _voterId, _uniqueId, _phoneNumber, _imageUrl, _age, _gender);
    }

    function getStoredUniqueId(address _voter) public view returns (bytes32) {
        return voterDetails[_voter].uniqueId;
    }

    function addCandidate(string[] memory _names) public onlyOwner {
        require(_names.length > 0, "Candidate names array must not be empty");

        for (uint i = 0; i < _names.length; i++) {
            require(bytes(_names[i]).length > 0, "Candidate name must not be empty");

            candidates.push(Candidate({
                id: candidates.length,
                name: _names[i],
                numberOfVotes: 0
            }));
            emit CandidateAdded(_names[i]);
        }
    }

    function voterStatus(address _voter) public view returns (bool) {
        return voterDetails[_voter].registered;
    }

    function getVoterDetails(address _voter) public view returns (
        string memory name, 
        string memory voterId,
        bytes32 uniqueId, 
        string memory phoneNumber, 
        string memory imageUrl,
        uint8 age,
        string memory gender,
        bool hasVoted
    ) {
        Voter memory voter = voterDetails[_voter];
        require(voter.registered, "Voter not registered.");
        return (
            voter.name, voter.voterId, voter.uniqueId, voter.phoneNumber,
            voter.imageUrl, voter.age, voter.gender, voter.hasVoted
        );
    }

    function validateVoterDetails(
        address _voter,
        string memory _name,
        string memory _voterId,
        bytes32 _uniqueId,
        string memory _phoneNumber
    ) internal view {
        Voter memory voter = voterDetails[_voter];

        require(
            keccak256(abi.encodePacked(voter.name)) == keccak256(abi.encodePacked(_name)),
            "Name does not match."
        );
        require(
            keccak256(abi.encodePacked(voter.voterId)) == keccak256(abi.encodePacked(_voterId)),
            "Voter ID does not match."
        );
        require(
            voter.uniqueId == _uniqueId,
            "Unique ID does not match."
        );
        require(
            keccak256(abi.encodePacked(voter.phoneNumber)) == keccak256(abi.encodePacked(_phoneNumber)),
            "Phone number does not match."
        );
    }

    function voteTo(
        uint256 _id,
        string memory _name,
        string memory _voterId,
        bytes32 _uniqueId,
        string memory _phoneNumber
    ) public {
        require(checkElectionPeriod(), "Election period has ended");
        require(voterStatus(msg.sender), "You must be registered to vote.");
        require(_id < candidates.length, "Invalid candidate ID.");
        require(!voterDetails[msg.sender].hasVoted, "You have already voted.");

        validateVoterDetails(msg.sender, _name, _voterId, _uniqueId, _phoneNumber);

        candidates[_id].numberOfVotes++;
        voterDetails[msg.sender].hasVoted = true;

        emit Voted(msg.sender, _id);
    }

    function retrieveVotes() public view returns (Candidate[] memory) {
        return candidates;
    }

    function electionTimer() public view returns (uint256) {
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return (votingEnd - block.timestamp);
    }

    function checkElectionPeriod() public view returns (bool) {
        return (electionStarted && block.timestamp <= votingEnd && block.timestamp >= votingStart);
    }

    function resetAllVoterStatus() public onlyOwner {
        for (uint256 i = 0; i < listOfVoters.length; i++) {
            voterDetails[listOfVoters[i]].hasVoted = false;
        }
    }

    function getVoterStatus(address _voter) public view returns (bool hasVoted) {
        return voterDetails[_voter].hasVoted;
    }

    function resetElection() public onlyOwner {
        require(block.timestamp > votingEnd, "The election period has not ended yet");

        while (candidates.length > 0) {
            candidates.pop();
        }

        for (uint256 i = 0; i < listOfVoters.length; i++) {
            address voter = listOfVoters[i];
            bytes32 uniqueId = voterDetails[voter].uniqueId;
            delete uniqueIdToAddress[uniqueId];
            delete voterDetails[voter];
        }

        delete listOfVoters;
        electionStarted = false;
        votingStart = 0;
        votingEnd = 0;
    }
}
