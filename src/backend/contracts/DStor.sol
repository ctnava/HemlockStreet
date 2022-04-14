// SPDX-License-Identifier: MIT
// Contract by CAT6#2699
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFissionEngine { function flipRate() external view returns(uint tokensPerUnit); }

contract DStor is Ownable {
	event FileUploaded(address sender, address recipient);
	event FileUpdated(address recipient);
	string public constant name = 'DStor@HemlockStreet';
	address public fissionEngine;
	uint public pinningRate = 150; // pennies
	uint public minimumPin = 30; // days

	constructor() { }

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
	mapping(uint => uint) public expiresAt;
	mapping(uint => File) private files;
	uint public fileCount = 0;

	function quote(uint numBytes) public view returns(uint perDiem, uint benchFee){
		require(numBytes >= 1024);
		uint numKb = numBytes / 1024;
		if (numBytes % 1024 > 0) { numKb++; }
		uint usdPerDayPerKb = (pinningRate * (10 ** 6)) / 1048576; // (1.50/1048576) * 10e8 == 1430.5
		perDiem =  (numKb * usdPerDayPerKb);
		benchFee = perDiem * minimumPin;
	}

	function gasQuote(uint numBytes) public view returns(uint weiPerDiem, uint weiBenchFee) {
		(uint perDiem, uint benchFee) = quote(numBytes);
		IFissionEngine FissionEngine = IFissionEngine(fissionEngine);
		uint flipped = FissionEngine.flipRate();
		weiPerDiem = (perDiem * flipped) / (10**8);
		weiBenchFee = (benchFee * flipped) / (10**8);
	}

	function upload(string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName, string memory _fileDescription, address recipient) public {
		require(bytes(_fileHash).length > 0 && _fileSize >= 1024 && bytes(_fileType).length > 0 && bytes(_fileName).length > 0  && bytes(_fileDescription).length > 0  && msg.sender!=address(0) && recipient != msg.sender && recipient!=address(0));
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
		emit FileUploaded(msg.sender, recipient);
	}

	function modify(uint fileId, string memory fileName, string memory description, address recipient) public {
		File storage file = files[fileId];
		require(file.uploader == msg.sender, "ACCESS DENIED");
		uint nameLength = bytes(fileName).length;
		uint descriptionLength = bytes(description).length;
		if((nameLength != 0 || descriptionLength != 0 || recipient != address(0)) && recipient != msg.sender) {
			if(nameLength != 0) { file.fileName = fileName; }
			if(descriptionLength != 0) { file.fileDescription = description; }
			if(recipient != address(0)) { file.recipient = recipient; }
		} else { revert(); }
		emit FileUpdated(file.recipient);
	}

	function get(uint fileId) public view returns(File memory) {
		File memory file = files[fileId];
		require(file.uploader == msg.sender || file.recipient == msg.sender, "ACCESS DENIED");
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

	function sent() public view returns(File[] memory) { return getAccessibleFiles(true); }

	function received() public view returns(File[] memory) { return getAccessibleFiles(false); }

	function setRules(bool isMinimumPin, uint value) public onlyOwner {
		if (isMinimumPin == true) { minimumPin = value; }
		else { pinningRate = value; }
	}

	function setFission(address fission) public onlyOwner { fissionEngine = fission; }

	function takeProfit() public {
		payable(owner()).transfer(address(this).balance);
	}
}