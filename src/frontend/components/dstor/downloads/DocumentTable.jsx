import React from 'react';
import Fields from './Fields';
import Query from './Query';
import { Table, Row } from 'react-bootstrap'


function DocumentTable(props) {
    const show = props.show;
    const query = props.query;

    function filteredResults() {
        const collection = props.docs.contents;
		const expDates = props.docs.expDates;
		const stringResults = {contents: [], expDates: []}
		collection.forEach((document, index) => { 
			const normalized = { 
				name: document.fileName, 
				type: document.fileType, 
				memo: document.fileDescription, 
				hash: document.fileHash, 
				timestamp: document.timestamp,
				expiration: expDates[index],
				size: document.fileSize,
				from: document.uploader, 
				to: document.recipient 
			}
			const strFields = ["name", "type", "memo", "hash", "from", "to"];
			var matchedFields = [];
			strFields.forEach((field) => {matchedFields.push(query[field].length === 0 ? true : false)});
			strFields.forEach((field, index) => {
				if (matchedFields[index] === false) { 
					if (normalized[field].includes(query[field])) { 
						matchedFields[index] = true; 
					} 
				}
			});
			if (!matchedFields.includes(false)) { stringResults.contents.push(document); stringResults.expDates.push(expDates[index]); }
		});
        const qr = {contents: [], expDates: []}
        collection.forEach((document, index) => { 
			const normalized = { 
				name: document.fileName, 
				type: document.fileType, 
				memo: document.fileDescription, 
				hash: document.fileHash, 
				timestamp: document.timestamp,
				expiration: expDates[index],
				size: document.fileSize,
				from: document.uploader, 
				to: document.recipient 
			}
			const numFields = ["timestamp", "expiration", "size"];
			var matchedFields = [];
			numFields.forEach((field) => {matchedFields.push(query[field].length === 0 ? true : false)});
			numFields.forEach((field, index) => {
				if (matchedFields[index] === false) { 
					if (normalized[field].includes(query[field])) { 
						matchedFields[index] = true; 
					} 
				}
			});
			if (!matchedFields.includes(false)) { qr.contents.push(document); qr.expDates.push(expDates[index]); }
		});
        return stringResults; // qr
    }

    const docs = filteredResults();
    const messages = docs.contents;
    const expDates = docs.expDates;

    return(
    <Row>
        <Row>
            <Fields 
            show={props.show} 
            setShow={props.setShow} 
            />
            <Query 
            showQueryField={props.showQueryField}
		    setShowQueryField={props.setShowQueryField}
		    query={props.query}
            resetQuery={props.resetQuery}
		    handleQuery={props.handleQuery}
            />
        </Row>
    <Table className="px-5 container" striped bordered hover variant="dark">
    <thead>
        <tr>
            {show.hash && (<th>IPFS</th>)}
            {show.name && (<th>File</th>)}
            {show.type && (<th>Type</th>)}
            {show.memo && (<th>Memo</th>)}
            {show.size && (<th>Size</th>)}
            {show.timestamp && (<th>Timestamp</th>)}
            {show.expiration && (<th>Expires At</th>)}
            {show.from && (<th>Sender</th>)}
            {show.to && (<th>Receiver</th>)}
            <th>Actions</th>
        </tr>
    </thead>
    
    <tbody>
        { messages.map((message, index) => {
            const timestamp = new Date((message.uploadTime.toNumber()) * 1000);
            const expDate = new Date((expDates[index].toNumber()) * 1000);
            return(
        <tr key={index}>
            {show.hash && (<td>{message.fileHash}</td>)}
            {show.name && (<td>{message.fileName}{message.fileType}</td>)}
            {show.type && (<td>{message.fileType}</td>)}
            {show.memo && (<td>{message.fileDescription}</td>)}
            {show.size && (<td>{props.bytes(message.fileSize.toNumber())}</td>)}
            {show.timestamp && (<td>{timestamp.toLocaleString()}</td>)}
            {show.expiration && (<td>{expDate.toLocaleString()}</td>)}
            {show.from && (<td>{message.uploader}</td>)}
            {show.to && (<td>{message.recipient}</td>)}
            <td>
                <a 
                href={`https://ipfs.infura.io/ipfs/${message.fileHash}?filename=${message.fileName}${message.fileType}&download=true`}
                rel="noopener noreferrer"
                target="_blank"
                >download</a>
            </td>
        </tr>);
        }) }
    </tbody>
    </Table>
    {messages.length === 0 && (<p>No messages found.</p>)}
    </Row>
    );
}

export default DocumentTable;