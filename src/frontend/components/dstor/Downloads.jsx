import React, { useState } from 'react'
import { Table, Form, Row, Col, Button } from 'react-bootstrap'


function niceBytes(x){
 	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(x, 10) || 0;
	while(n >= 1024 && ++l){n = n/1024;}
	return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

function Downloads(props) {
	const [documents, setDocuments] = useState(props.docs);

	const [showQuery, setShowQuery] = useState(false);
	const [query, setQuery] = useState("");

	function handleChange(event) { setQuery(event.target.value); }

	const [hidden, setHidden] = useState([]);

	const [showToggles, setShowToggles] = useState(false);
		const [showHidden, setShowHidden] = useState(false);
		const [showName, setShowName] = useState(true);
		const [showType, setShowType] = useState(false);
		const [showMemo, setShowMemo] = useState(true);
		const [showHash, setShowHash] = useState(false);
		const [showTimestamp, setShowTimestamp] = useState(false);
		const [showSize, setShowSize] = useState(false);
		const [showFrom, setShowFrom] = useState(false);
		const [showTo, setShowTo] = useState(false);

	if (documents.length === 0) {
		return(<p>No documents found, upload at least one to populate this field.</p>);
	}

	return(
		<div className="flex justify-center">
			<div>
				<Row>
					<Col 
					xl={showQuery ? "12" : showToggles ? "12" : "4"} 
					lg={showQuery ? "12" : showToggles ? "12" : "4"} 
					md={showQuery ? "12" : showToggles ? "12" : "4"} 
					sm={showQuery ? "12" : showToggles ? "12" : "4"} 
					xs={showQuery ? "12" : showToggles ? "12" : "4"}>
						{ (!showToggles || showQuery) && (<Button className="my-3" onClick={() => {setShowQuery(!showQuery);}}>Refined Search</Button>) }
						{ showQuery && (
						<Form>
							<Form.Label>Search</Form.Label>
							<Form.Control 
							type="text" 
							name="queryInput" 
							onChange={handleChange} 
							placeholder="Query"
							value={query}
							/>
						</Form>)}
					</Col>
					
					<Col 
					xl={showToggles ? "12" : showQuery ? "12" : "4"} 
					lg={showToggles ? "12" : showQuery ? "12" : "4"} 
					md={showToggles ? "12" : showQuery ? "12" : "4"} 
					sm={showToggles ? "12" : showQuery ? "12" : "4"} 
					xs={showToggles ? "12" : showQuery ? "12" : "4"}>
						<Button className="my-3" onClick={() => {setShowToggles(!showToggles);}}>Toggle Field Visibility</Button>
						{ showToggles && (
						<div>
							<Button className="mx-1 my-1" onClick={() => {setShowHidden(!showHidden);}}>Hidden</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowHash(!showHash)}}>CID</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowName(!showName)}}>File</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowType(!showType)}}>Type</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowMemo(!showMemo)}}>Memo</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowTimestamp(!showTimestamp)}}>Timestamp</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowSize(!showSize)}}>Size</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowFrom(!showFrom)}}>Sender</Button>
							<Button className="mx-1 my-1" onClick={() => {setShowTo(!showTo)}}>Receiver</Button>
						</div>)}
					</Col>

					{ showToggles && (
					<Col 
					xl={showQuery ? "12" : showToggles ? "12" : "4"} 
					lg={showQuery ? "12" : showToggles ? "12" : "4"} 
					md={showQuery ? "12" : showToggles ? "12" : "4"} 
					sm={showQuery ? "12" : showToggles ? "12" : "4"} 
					xs={showQuery ? "12" : showToggles ? "12" : "4"}>
						{ showToggles && !showQuery && (<Button className="my-3" onClick={() => {setShowQuery(!showQuery);}}>Refined Search</Button>) }
					</Col>
					) }

					<Col 
					xl={!showToggles && !showQuery ? "4" : (showToggles && !showQuery) || (!showToggles && showQuery) ? "6" : "12"}  
					lg={!showToggles && !showQuery ? "4" : (showToggles && !showQuery) || (!showToggles && showQuery) ? "6" : "12"}  
					md={!showToggles && !showQuery ? "4" : (showToggles && !showQuery) || (!showToggles && showQuery) ? "6" : "12"}  
					sm={!showToggles && !showQuery ? "4" : (showToggles && !showQuery) || (!showToggles && showQuery) ? "6" : "12"}  
					xs={!showToggles && !showQuery ? "4" : (showToggles && !showQuery) || (!showToggles && showQuery) ? "6" : "12"} >
					<Button className="my-3" onClick={() => {setShowHidden(!showHidden);}}>Show Only Hidden</Button>
					</Col>
				</Row>
			</div>

			<hr/>

			<Row>
				<Table className="px-5 container" striped bordered hover variant="dark">
					<thead>
						<tr>
							{showHash && (<th>IPFS</th>)}
							{showName && (<th>File</th>)}
							{showType && (<th>Type</th>)}
							{showMemo && (<th>Memo</th>)}
							{showSize && (<th>Size</th>)}
							{showTimestamp && (<th>Timestamp</th>)}
							{showFrom && (<th>Sender</th>)}
							{showTo && (<th>Receiver</th>)}
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
					{ documents.map((doc, index) => {
						var timestamp = doc.uploadTime.toNumber();
						const toMs = timestamp * 1000;
						timestamp = new Date(toMs); 
						return(
						<tr key={index}>
							{showHash && (<td>{doc.fileHash}</td>)}
							{showName && (<td>{doc.fileName}{doc.fileType}</td>)}
							{showType && (<td>{doc.fileType}</td>)}
							{showMemo && (<td>{doc.fileDescription}</td>)}
							{showSize && (<td>{niceBytes(doc.fileSize.toNumber())}</td>)}
							{showTimestamp && (<td>{timestamp.toLocaleString()}</td>)}
							{showFrom && (<td>{doc.uploader}</td>)}
							{showTo && (<td>{doc.recipient}</td>)}
							<td>
								<div onClick={() => {setHidden((prev) => [...prev, index]);}}>hide</div> / 
								<a 
								href={`https://ipfs.infura.io/ipfs/${doc.fileHash}?filename=${doc.fileName}${doc.fileType}&download=true`}
								rel="noopener noreferrer"
								target="_blank"
								>download</a>
							</td>
						</tr>);
					}) }
					</tbody>
				</Table>
			</Row>
		</div>
	);
}

export default Downloads;
