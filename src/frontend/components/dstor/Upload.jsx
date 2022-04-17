import React, { useState } from 'react'
import { Row, Form, Button, InputGroup } from 'react-bootstrap'
import { Buffer } from 'buffer';


var readyMessage = "I have made sure that these are the correct details. Pin to IPFS!";
function Upload(props) {
	const [fileData, setFileData] = useState(null);

	const defaultInput = { hash: "", size: 0, type: "", name: "", description: "", recipient: "" };
	const [contractInput, setContractInput] = useState(defaultInput);

	const defaultQuote = {
		perDiem: 0,
		bench: 0,
		gasPerDiem: 0,
		gasBench: 0
	};
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

	function retrieveFile(event) {
		event.preventDefault();
		const file = event.target.files[0];
		const reader = new window.FileReader();
		const name = file.name;
		const type = name.slice(name.indexOf("."), name.length);

		reader.readAsArrayBuffer(file);
		reader.onload = () => {
			console.log("PREPARING");
			let result = reader.result;
			// while (result === null) { 
			// 	function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
			// 	sleep(1000).then(()=> {
			// 		console.log("FAILED! ATTEMPTING TO GET A RESULT"); 
			// 		result = reader.result;
			// 	});
			// }
			console.log("SUCCESS! BUFFERING & COMPARING"); // console.log("SUCCESS! BUFFERING");
			let data = Buffer(result);
			// console.log("COMPARING");
			if (data.length >= 1024) {
				console.log("STORING");
				setFileData(data);
				setContractInput(prev => {  return({...prev, hash: "", size: data.length, type: type}) });
				getQuote(data.length);
			} else { 
				console.log("RESETTING");
				setFileData(null);
				setContractInput(defaultInput);
			}
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		props.ipfs.add(fileData).then((result) => {
			readyMessage = "Uploading... Please Wait";
			props.ipfs.pin.add(result.path, (err) => {
				readyMessage = "Pinning... Please Wait";
				if(err) {console.log(err)}
				else {readyMessage = "Pinned!";}
			});
			setContractInput(prev => {return({...prev, hash: result.path})});
			console.log("File Uploaded to IPFS!");
			// console.log(contractInput);
		});
	}

	function handleTimeChange(event) {
		setAdditionalTime(event.target.value);
	}

	function getProjectedCost(type) {
		const bf = (type === "usd") ? (quote.bench / (10 ** 8)) : (quote.gasBench / (10 ** 18));
		const pd = (type === "usd") ? (quote.perDiem / (10 ** 8)) : (quote.gasPerDiem / (10 ** 18));
		const cost = (bf + (pd * additionalTime)).toString();
		return (cost.slice(0, cost.indexOf(".") + 9));
	}

	function handleChange(event) {
		const { name, value } = event.target;
		setContractInput(prev => {
			return {...prev, [name]: value};
		});
	}

	function submitForm(event) {
		// console.log(contractInput);
		const data = contractInput;
		setFileData(null);
		setContractInput(defaultInput);
		const messageValue = (quote.gasBench + (quote.gasPerDiem * additionalTime));
		props.uploadFile(data, messageValue);
	}

	return(<div>
	<Row className="g-4 py-5">
		<Form>
		{fileData !== null && (<div>
			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>File Name</InputGroup.Text>
						<Form.Control 
						type="text" 
						name="name" 
						onChange={handleChange} 
						placeholder="myFullMedicalHistory (Do NOT include extensions like '.pdf', '.exe', '.png', etc.)"
						value={contractInput.name}
						autoComplete="off"
						/>
					</InputGroup>
				</Form.Group>
			</Row>

			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>Receiver</InputGroup.Text>
						<Form.Control
						type="text"
						name="recipient"
						onChange={handleChange}
						placeholder="0x....... (Must be an on-chain address)"
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
				<InputGroup>
					<InputGroup.Text>First Month (to start) || ${(quote.bench / (10 ** 8))} USD as ~{(quote.gasBench) / (10 ** 18)} Tokens</InputGroup.Text>
					<InputGroup.Text>Every Day After || ${(quote.perDiem / (10 ** 8))} USD as ~{(quote.gasPerDiem / (10 ** 18))} Tokens</InputGroup.Text>
					<InputGroup.Text>Projected Cost || ${getProjectedCost("usd")} USD as ~{getProjectedCost("gas")} Tokens</InputGroup.Text>
				</InputGroup>
				</div>)}
				<InputGroup>
					<InputGroup.Text>File (Min. {props.bytes(props.rules.minimumFileSize)})</InputGroup.Text>
					<Form.Control 
					onChange={retrieveFile}
					name="rawFile"
					type="file" 
					/>
					{contractInput.hash.length !== 0 && (<InputGroup.Text>IPFS CID: {contractInput.hash}</InputGroup.Text>)}
					{fileData !== null ? (<InputGroup.Text>
						Extension: {contractInput.type} || Size: {props.bytes(contractInput.size)}
					</InputGroup.Text>) : (<InputGroup.Text>
						{props.rules.pinningRate}
					</InputGroup.Text>)}
				</InputGroup>
			</Form.Group>
			</Row>
		</Form>	
	</Row>

	{ contractInput.name.length !== 0 && !contractInput.name.includes(".") && contractInput.description.length !== 0 && contractInput.recipient.length === 42 && contractInput.recipient.slice(0,2) === "0x" && (<div>	
	<Row>
		<Button 
		onClick={contractInput.hash.length === 0 ? handleSubmit : submitForm} 
		variant={contractInput.hash.length === 0 ? "primary" : "warning" }
		>{contractInput.hash.length === 0 ? readyMessage  : "Store the file to the blockchain!"}</Button>
	</Row>
	</div>) }


	<p className="text-muted">
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
