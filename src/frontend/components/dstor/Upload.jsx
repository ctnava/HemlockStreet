import React, { useState } from 'react'
import Dropzone from './uploads/Dropzone';
import { Row, Form, Button, InputGroup } from 'react-bootstrap'
import { Buffer } from 'buffer';
import axios from "axios";

const readyMessage = "I have made sure that these are the correct details. Pin to IPFS!";
const pinningMessage = "Pinning... Please Wait";
function Upload(props) {
	const [fileData, setFileData] = useState(null);
    const [uploaded, setUploaded] = useState(null);
	const [pinning, setPinning] = useState(readyMessage);

	const defaultInput = { hash: "", size: 0, type: "", name: "", description: "", recipient: "" };
	const [contractInput, setContractInput] = useState(defaultInput);
	const [cipherInput, setCipherInput] = useState(undefined);

	function handleChange(event) {
		const { name, value } = event.target;
		setContractInput(prev => {
			return {...prev, [name]: value};
		});
	}

	const defaultQuote = { perDiem: 0, bench: 0, gasPerDiem: 0, gasBench: 0 };
	const [quote, setQuote] = useState(defaultQuote);

	function getQuote(numBytes) {
		props.getQuotes(numBytes).then((quotes) => {
			const [perDiem, bench, gasPerDiem, gasBench] = quotes;
			setQuote({ 
				perDiem: parseInt(perDiem.toString()),
				bench: parseInt(bench.toString()),
				gasPerDiem: parseInt(gasPerDiem.toString()),
				gasBench: parseInt(gasBench.toString())
			});
		});
	}
	
	const [additionalTime, setAdditionalTime] = useState(0);
	function handleTimeChange(event) { setAdditionalTime(event.target.value) }

	function getProjectedCost(type) {
		const bf = (type === "usd") ? (quote.bench / (10 ** 8)) : (quote.gasBench / (10 ** 18));
		const pd = (type === "usd") ? (quote.perDiem / (10 ** 8)) : (quote.gasPerDiem / (10 ** 18));
		const cost = (bf + (pd * additionalTime)).toString();
		return (cost.slice(0, cost.indexOf(".") + 9));
	}

	function pinToServer(event) {
		setPinning(pinningMessage);

		const url = 'http://localhost:4001/pin'; 
		const data = { 
			fileName: fileData.finalName, 
			contractMetadata: { 
				chainId: props.client.chainId, 
				contract: props.contract.address
			}, 
			contractInput: contractInput 
		};
		// console.log(data);
		axios.post(url, data, {'Content-Type': 'application/json'})
			.then((res) => {
				console.log(res);
				setContractInput(prev => {return({...prev, hash: result.path})});
				setPinning(readyMessage);
				console.log("File Uploaded to IPFS!");
				setCipherInput();
			});
		event.preventDefault();
	}

	function makeTransaction(event) {
		// console.log(contractInput);
		const data = contractInput;
		setFileData(null);
		setContractInput(defaultInput);
		const messageValue = (quote.gasBench + (quote.gasPerDiem * additionalTime));
		props.uploadFile(data, messageValue);
	}

	// console.log(contractInput);

	return(<div>
	<div>{uploaded === null && (<p>{props.rules.pinningRate}</p>)}</div>
	<div className="g-4 py-2">
		<Dropzone 
		bytes={props.bytes}
		min={props.rules.minimumFileSize}
		pinningRate={props.rules.pinningRate}
		hash={contractInput.hash}
		getProjectedCost={getProjectedCost}

		quote={quote}
		getQuote={getQuote}

		contractInput={contractInput}
		setContractInput={setContractInput}
		fileData={fileData}
		setFileData={setFileData}
		uploaded={uploaded}
		setUploaded={setUploaded}
		/>
	</div>
	<Row className="g-4 py-2">
		<Form>
		{fileData !== null && (<div>
			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>Receiver</InputGroup.Text>
						<Form.Control
						type="text"
						name="recipient"
						onChange={handleChange}
						placeholder="0x......."
						value={contractInput.recipient}
						autoComplete="off"
						/>
					</InputGroup>
				</Form.Group>
			</Row>
			
			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>Secret<br/>Message</InputGroup.Text>
						<Form.Control 
						as="textarea" 
						rows={5}
						name="description" 
						onChange={handleChange} 
						placeholder="The password is 'saltyH4ckerTears[2_1337_4U]' (single quotes not included)
						(This memo will only visible to you and the recipient through this DApp. )"
						value={contractInput.description}
						/>
					</InputGroup>
				</Form.Group>
			</Row>
			</div>)}
			<Row>
			<Form.Group>
				{fileData !== null && (<div>
				<InputGroup>
					<InputGroup.Text>Additional Storage Time</InputGroup.Text>
					<Form.Control 
					onChange={handleTimeChange}
					type="number" 
					min="0"
					placeholder="in days"
					/>
					<InputGroup.Text>Days</InputGroup.Text>
					
				</InputGroup>
				</div>)}
			</Form.Group>
			</Row>
		</Form>	
	</Row>

	{ uploaded === true && contractInput.name.length !== 0 && !contractInput.name.includes(".") && contractInput.description.length !== 0
	 && contractInput.recipient.length === 42 && contractInput.recipient.slice(0,2) === "0x" && (<div>	
	<Row>
		<Button 
		onClick={contractInput.hash.length === 0 ? pinToServer : makeTransaction} 
		variant={contractInput.hash.length === 0 ? "warning" : "danger" }
		>{contractInput.hash.length === 0 ? pinning  : "Store the file to the blockchain!"}</Button>
	</Row>
	</div>) }

	<p className="g-4 py-2 text-muted">
		DISCLAIMER: This DApp will upload the specified file to IPFS; a free, secure, and decentralized file storage protocol. 
		It is your responsibility to encrypt the file itself for enhanced privacy protection. When a file is uploaded to IPFS,
		it is retrievable via a Content Identifier (CID) that is generated with respect to the file's contents and metadata. 
		Consequently, all content on IPFS is inherently anonymous (unlabeled and without file type extensions). Please label 
		and describe your file appropriately to ensure that your content makes it to the intended recipient in a recognizable 
		manner.
	</p>

</div>);
}

export default Upload;
