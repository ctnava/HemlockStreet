import React, { useState, useEffect } from 'react'
import Dropzone from './uploads/Dropzone';
import { Row, Form, Button, InputGroup } from 'react-bootstrap'
import { Buffer } from 'buffer';
import axios from "axios";

const url = 'http://localhost:4001/'; 
const readyMessage = "I have made sure that these are the correct details. Pin to IPFS!";
const pinningMessage = "Pinning... Please Wait";
function Upload(props) {
    const [busy, setBusy] = useState(false);
	const [fileData, setFileData] = useState(null);
    const [uploaded, setUploaded] = useState(null);
	const [pinning, setPinning] = useState(readyMessage);

	const defaultInput = { hash: "", size: 0, type: "", name: "", description: "", recipient: "" };
	const [contractInput, setContractInput] = useState(defaultInput);
	const [cipherInput, setCipherInput] = useState(defaultInput);

	function resetCipherInput() {
		setCipherInput(defaultInput);
	}

	function handleChange(event) {
		const { name, value } = event.target;
		setContractInput(prev => {
			return {...prev, [name]: value};
		});
	}

	const [pinTimer, setPinTimer] = useState(undefined);
	useEffect(() => {
		if (contractInput.hash.length !== 0 && pinTimer === undefined) setPinTimer(60);
	}, [contractInput, pinTimer]);

	useEffect(() => {
		if (pinTimer !== undefined) {
			if (pinTimer === 0) {
				setPinTimer(undefined);
				unpinFile();
			} else {
				const intervalId = setInterval(() => {setPinTimer(pinTimer-1)}, 1000);
				return () => clearInterval(intervalId);
			}
		}
	}, [pinTimer]);

	const [delTimer, setDelTimer] = useState(undefined);
	useEffect(() => {
		if (fileData !== null && delTimer === undefined) setDelTimer(300);
	}, [fileData, delTimer]);

	useEffect(() => {
		if (delTimer !== undefined) {
			if (delTimer === 0) {
				setDelTimer(undefined);
				deleteFile();
			} else {
				const intervalId = setInterval(() => {setDelTimer(delTimer-1)}, 1000);
				return () => clearInterval(intervalId);
			}
		}
	}, [delTimer]);

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

		const data = { 
			fileName: fileData.finalName, 
			contractMetadata: { 
				chainId: props.client.chainId, 
				contract: props.contract.address,
				abi: props.abi
			}, 
			contractInput: contractInput 
		};
		// console.log(data);
		axios.post(url + "pin", data, {'Content-Type': 'application/json'})
			.then((res) => {
				if (res.data.hash && res.data.encryptedInputs) {
					setContractInput(prev => {return({...prev, hash: res.data.hash})});
					setPinning(readyMessage);
					console.log("File Uploaded to IPFS!");
					setCipherInput(res.data.encryptedInputs);
				} else {
					setPinning(readyMessage);
					console.log(res.data);
				}
			});
		event.preventDefault();
	}

	function deleteFile() {
        if (fileData !== null && uploaded === true) {
            console.log("Requesting Deletion...");
            const data = { fileName: fileData.finalName };
            axios.delete(url + "upload", { data: data, 'Content-Type': 'application/json'})
            .then((res) => {
                if (res.data === 'success') {
                    setFileData(null);
                    setUploaded(null);
                } else { console.log(res.data) }
            });
        } else { console.log("Something went wrong with deleteFile()") }
    }

	function unpinFile() {
        console.log("Requesting Unpin...");
        setBusy(true)
        const data = { 
            hash: contractInput.hash,
            cipher: cipherInput.hash
        };
        axios.delete('http://localhost:4001/pin', { data: data, 'Content-Type': 'application/json'})
        .then((res) => {
            if (res.data === 'success') {
                deleteFile();
                setContractInput(prev => { return { ...prev, hash: "" } });
                resetCipherInput();
            } else { console.log(res.data) }
        });
    }

	// disable input before transaction
	function makeTransaction(event) {
		// console.log(contractInput);
		const input = cipherInput;
		// console.log(input);
		const messageValue = (quote.gasBench + (quote.gasPerDiem * additionalTime));
		props.uploadFile(input, messageValue).then((tx) => {
			const data = { 
				hash: contractInput.hash, 
				cipher: cipherInput.hash,
				contractMetadata: { 
					chainId: props.client.chainId, 
					contract: props.contract.address,
					abi: props.abi
				}, 
				tx: tx.hash 
			};
			axios.post(url + "transaction", data, {'Content-Type': 'application/json'}).then(res => {
				if (res.data === "success") {
					setFileData(null);
					setContractInput(defaultInput);
					setCipherInput(defaultInput);
					deleteFile();
					props.setShowUpload(false);
					props.setLoading(true);
				}
			});
		});
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
		busy={busy}
		setBusy={setBusy}

		quote={quote}
		getQuote={getQuote}

		contractInput={contractInput}
		setContractInput={setContractInput}
		cipherInput={cipherInput}
		resetCipherInput={resetCipherInput}
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
						disabled={contractInput.hash.length !== 0 ? "not":""}
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
						disabled={contractInput.hash.length !== 0 ? "not":""}
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
	 && contractInput.recipient.length === 42 && contractInput.recipient.slice(0,2) === "0x" && busy === false && (<div>	
	<Row>
		<Button 
		onClick={contractInput.hash.length === 0 ? pinToServer : makeTransaction} 
		variant={contractInput.hash.length === 0 ? "warning" : "danger" }
		>{contractInput.hash.length === 0 ? (pinning + " || Time Left("+delTimer+"s)")  : "Transact || Time Left(" + pinTimer+ "s)"}</Button>
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
