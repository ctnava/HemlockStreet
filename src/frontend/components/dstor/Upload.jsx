import React, { useState } from 'react'
import { Row, Form, Button } from 'react-bootstrap'
import { Buffer } from 'buffer';


function Upload(props) {
	const [fileData, setFileData] = useState(null);

	const defaultInput = { hash: "", size: 0, type: "", name: "", description: "", recipient: "" };
	const [contractInput, setContractInput] = useState(defaultInput);

	function retrieveFile(event) {
		event.preventDefault();
		const file = event.target.files[0];
		const reader = new window.FileReader();
		const name = file.name;
		const type = name.slice(name.indexOf("."), name.length);
		
		reader.readAsArrayBuffer(file);
		reader.onloadend = () => { 
			let data = Buffer(reader.result);
			setFileData(data);
			setContractInput(prev => {return({...prev, hash: "", size: data.length, type: type})});
		}
	}

	function handleSubmit(event) {
		event.preventDefault();
		props.ipfs.add(fileData).then((result) => {
			props.ipfs.pin.add(result.path, (err) => {
					if(err) {console.log(err)}
					else {console.log("Pinned")}
				});
			setContractInput(prev => {return({...prev, hash: result.path})});
			console.log("File Uploaded to IPFS!");
		});
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
		props.uploadFile(data);
	}

	return(
		<div>
			<Row className="g-4 py-5">
				<Row>
					<Form>
						<Form.Group>
							<Form.Label>File (Size Min. 1KB)</Form.Label>
							<Form.Control 
							onChange={retrieveFile}
							name="rawFile"
							type="file" 
							/>
							{fileData !== null && contractInput.hash.length === 0 && (
							<Form.Text className="text-muted">
								Extension: {contractInput.type} || Size: {props.bytes(contractInput.size)} || Pinning Quote: ~${(Math.round(contractInput.size * (150 / (1073741824))) / 100)} USD/month<br/>
								Price (in Network Native Token): 
							</Form.Text>)}
							{fileData !== null && contractInput.hash.length !== 0 && (
							<Form.Text className="text-muted">
								CID: {contractInput.hash}<br/>
								Extension: {contractInput.type} || Size: {props.bytes(contractInput.size)} || Pinning Quote: ~${(Math.round(contractInput.size * (150 / (1073741824))) / 100)} USD/month<br/>
								Price (in Network Native Token): 
							</Form.Text>)}
						</Form.Group>

						{fileData !== null && contractInput.hash.length === 0 &&(
						<Form.Group>
							<Row>
								<Button 
								onClick={handleSubmit} 
								variant="warning" 
								>
								This is the correct file
								</Button>
							</Row>
						</Form.Group>)}
					</Form>	
				</Row>

				{contractInput.hash.length !== 0 && (
				<Form>
					<Form.Group>
						<Form.Label>Label</Form.Label>
						<Form.Control 
						type="text" 
						name="name" 
						onChange={handleChange} 
						placeholder="myFullMedicalHistory"
						value={contractInput.name}
						/>
						<Form.Text className="text-muted">Do NOT include the extension (e.g. '.pdf', '.exe', '.png', etc.)</Form.Text>
					</Form.Group>

					<Form.Group>
						<Form.Label>Recipient</Form.Label>
						<Form.Control
						type="text"
						name="recipient"
						onChange={handleChange}
						placeholder="0x......."
						value={contractInput.recipient}
						/>
					</Form.Group>

					<Form.Group>
						<Form.Label>Memo</Form.Label>
						<Form.Control 
						as="textarea" 
						rows={5}
						name="description" 
						onChange={handleChange} 
						placeholder="The password is 'saltyH4ckerTears[2_1337_4U]' (single quotes not included)"
						value={contractInput.description}
						/>
						<Form.Text className="text-muted">This memo will only visible to you and the recipient through this DApp.</Form.Text>
					</Form.Group>

					{contractInput.name.length !== 0 && contractInput.description.length !== 0 && (
					<Form.Group>
						<Row>
							<Button 
							onClick={submitForm} 
							variant="warning" 
							>These are the correct details. Store the file to the blockchain!</Button>
						</Row>
					</Form.Group>)}
				</Form>)}
			</Row>
		
			<Row className="g-4">
				<Form.Text className="text-muted">
					DISCLAIMER: This DApp will upload the specified file to IPFS; a free, secure, and decentralized file storage protocol. 
					It is your responsibility to encrypt the file itself for enhanced privacy protection. When a file is uploaded to IPFS,
					it is retrievable via a Content Identifier (CID) that is generated with respect to the file's contents and metadata. 
					Consequently, all content on IPFS is inherently anonymous (unlabeled and without file type extensions). Please label 
					and describe your file appropriately to ensure that your content makes it to the intended recipient in a recognizable 
					manner.
				</Form.Text>
			</Row>
		</div>
	);
}

export default Upload;
