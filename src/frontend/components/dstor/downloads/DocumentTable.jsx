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
        const ids = props.docs.ids;
		const qr = {contents: [], expDates: [], ids: []};
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
			var matchedStrFields = [];
			strFields.forEach((field) => {matchedStrFields.push(
                query[field].length === 0 ? true : false
            )});
			strFields.forEach((field, fieldIndex) => {
				if (matchedStrFields[fieldIndex] === false) { 
					if (normalized[field].includes(query[field])) { 
						matchedStrFields[fieldIndex] = true; 
					} 
				}
			});
            
            var matchedNumFields = []; /*size*/
            matchedNumFields.push(
                (query.size.min === 0 && query.size.max === 1024 && query.size.units === "YB") ? true : false
            );
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            if (matchedNumFields[0] === false) {
                const multiplier = 1024 ** (units.indexOf(query.size.units));
                // console.log(multiplier);
                const size = parseInt(normalized.size.toString());
                // console.log("max", parseInt(query.size.max) * multiplier);
                // console.log(size);
                // console.log("min", parseInt(query.size.min) * multiplier);
                if (size <= (parseInt(query.size.max) * multiplier) && size >= (parseInt(query.size.min) * multiplier)) { 
                    matchedNumFields[0] = true 
                }
            }

            const dateFields = ["timestamp", "expiration"];
            var matchedDateFields = [];
            dateFields.forEach((field) => {matchedDateFields.push(
                ((query[field].start).toString() === (new Date("2020/03/13")).toString() && (query[field].end).toString() === props.defaultEnd.toString()) ? true : false
            )});
            dateFields.forEach((field, fieldIndex) => {
                if (matchedDateFields[fieldIndex] === false) {
                    /*if(normalized[field] something something)*/
                    console.log("tripped");
                    // console.log(query[field].end.toString());
                    // console.log(props.defaultEnd.toString()); 
                }
            });

			if (!matchedStrFields.includes(false) && !matchedNumFields.includes(false) && !matchedDateFields.includes(false)) { 
                qr.contents.push(document); 
                qr.expDates.push(expDates[index]); 
                qr.ids.push(ids[index]); 
            }
		});

        return qr; // qr
    }

    const docs = filteredResults();
    const messages = docs.contents;
    const expDates = docs.expDates;
    const ids = docs.ids;

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
            handleSizeQuery={props.handleSizeQuery}
            handleDateQuery={props.handleDateQuery}
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
        <tr key={ids[index]}>
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