// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFissionEngine { function flipRate() external view returns(uint tokensPerUnit); }

contract DStor is Ownable {
	event FileUpdated(address recipient);
	string public constant name = 'DeadDrop@HemlockStreet';
	address public fissionEngine;
	uint public pinningRate = 150; // pennies
	uint public minimumPin = 30; // days
	uint public minimumFileSize = 1024; // bytes

	constructor( ) { }

	struct File {
		string fileHash;
		uint fileSize;
		string fileType;
		string fileName;
		string fileDescription;
		address recipient;
		uint uploadTime;
		address uploader;
	}
	mapping(string => uint) public expirationDates;
	mapping(uint => File) private files;
	uint public fileCount = 0;

	function quote(uint numBytes) public view returns(uint perDiem, uint benchFee){
		require(numBytes >= minimumFileSize, badCall);
		uint numKb = numBytes / 1024;
		if (numBytes % 1024 > 0) { numKb++; }
		benchFee = numKb * ((pinningRate * (10 ** 6)) / 1048576); // (1.50/1048576) * 10e8 == 1430.5
		perDiem =  (benchFee / 30);
	}

	function gasQuote(uint numBytes) public view returns(uint weiPerDiem, uint weiBenchFee) {
		(uint perDiem, uint benchFee) = quote(numBytes);
		IFissionEngine FissionEngine = IFissionEngine(fissionEngine);
		uint flipped = FissionEngine.flipRate();
		weiPerDiem = (perDiem * flipped) / (10**8);
		weiBenchFee = (benchFee * flipped) / (10**8);
	}

	string private constant badCall = "BAD CALL";
	string private constant denied = "ACCESS DENIED";
	string private constant lowVal = "VALUE LOW";
	string private constant selfSend = "NO SELF SEND";

	function addTime(uint fileId) public payable {
		File memory file = get(fileId);
		(uint perDiem, ) = gasQuote(file.fileSize);
		require(msg.value >= perDiem, lowVal);
		string memory hash = file.fileHash;
		require(expirationDates[hash] >= block.timestamp, denied);
		uint timeToAdd = (msg.value / perDiem) * 1 days;
		expirationDates[hash] += timeToAdd;
	}

	function upload(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription, address recipient) public payable {
		require(bytes(_fileHash).length > 0 && _fileSize >= minimumFileSize && bytes(_fileType).length > 0 && bytes(_fileName).length > 0  && bytes(_fileDescription).length > 0  && msg.sender!=address(0) && recipient!=address(0), badCall);
		require(recipient != msg.sender , selfSend);
		(uint perDiem, uint benchFee) = gasQuote(_fileSize);
		require(msg.value >= benchFee, lowVal);
		uint additionalTime = ((msg.value - benchFee) / perDiem) * 1 days;
		uint expDate = block.timestamp + (30 days) + additionalTime;
		expirationDates[_fileHash] = expDate;

		fileCount ++;
		files[fileCount] = File(
			_fileHash,
			_fileSize,
			_fileType,
			_fileName,
			_fileDescription,
			recipient,
			block.timestamp,
			msg.sender);
	}

	function modify(uint fileId, string memory fileName, string memory description, address recipient) public {
		File storage file = files[fileId];
		require(file.uploader == msg.sender, denied);
		require(recipient != msg.sender, selfSend);
		uint nameLength = bytes(fileName).length;
		uint descriptionLength = bytes(description).length;
		if((nameLength != 0 || descriptionLength != 0 || recipient != address(0))) {
			if(nameLength != 0) { file.fileName = fileName; }
			if(descriptionLength != 0) { file.fileDescription = description; }
			if(recipient != address(0)) { file.recipient = recipient; }
		} else { revert(badCall); }
		emit FileUpdated(file.recipient);
	}

	function get(uint fileId) public view returns(File memory) {
		File memory file = files[fileId];
		require(file.uploader == msg.sender || file.recipient == msg.sender, denied);
		return file;
	}

	function getAccessibleFileIds(bool isSender) public view returns(uint[] memory) {
		uint count;
		for (uint i = 0; i<= fileCount; i++) {
			address toValidate = isSender ? files[i].uploader : files[i].recipient;
			if (toValidate == msg.sender) { count++; }
		}
		uint[] memory result = new uint[](count);
		count = 0;
		for (uint i = 0; i<= fileCount; i++) {
			address toValidate = isSender ? files[i].uploader : files[i].recipient;
			if (toValidate == msg.sender) {
				result[count] = i;
				count++;
			}
		}
		return result;
	}

	function getAccessibleFiles(bool isSender) public view returns(File[] memory) {
		uint[] memory fileIds = (getAccessibleFileIds(isSender));
		uint numElements = fileIds.length;
		File[] memory result = new File[](numElements);
		for (uint i = 0; i < numElements; i++) {
			result[i] = get(fileIds[i]);
		}
		return result;
	}

	function getAccessibleExps(bool isSender) public view returns(uint[] memory) {
		File[] memory accFiles = (getAccessibleFiles(isSender));
		uint numElements = accFiles.length;
		uint[] memory result = new uint[](numElements);
		for (uint i = 0; i < numElements; i++) {
			result[i] = expirationDates[accFiles[i].fileHash];
		}
		return result;
	}

	function getAllData() public view returns(File[] memory sent, uint[] memory sentExps, File[] memory received, uint[] memory receivedExps) {
		sent = getAccessibleFiles(true);
		sentExps = getAccessibleExps(true);
		received = getAccessibleFiles(false);
		receivedExps = getAccessibleExps(false);
	}

	function batchExpQuery(string[] memory query) public view returns(bool[] memory isExpired, uint[] memory tilExpiry) {
		uint numElements = query.length;
		bool[] memory expired = new bool[](numElements);
		uint[] memory timeTil = new uint[](numElements);
		for (uint i = 0; i < numElements; i++) {
			uint expDate = expirationDates[query[i]];
			expired[i] = (expirationDates[query[i]] > block.timestamp);
			timeTil[i] = block.timestamp - expDate;
		}
		isExpired = expired;
		tilExpiry = timeTil;
	}

	function setRules(bool isMinimumPin, uint value) public onlyOwner {
		if (isMinimumPin == true) { minimumPin = value; }
		else { minimumFileSize = value; }
	}

	function setPinningRate(uint value) public onlyOwner {
		pinningRate = value;
	}

	function setFission(address fission) public onlyOwner { fissionEngine = fission; }

	function takeProfit() public {
		payable(owner()).transfer(address(this).balance);
	}
}
