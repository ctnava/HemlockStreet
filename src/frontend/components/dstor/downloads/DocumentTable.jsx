import React, { useState } from 'react';
import Fields from './Fields';
import Query from './Query';
import { Table, Row } from 'react-bootstrap';
import CryptoJS from "crypto-js";
import axios from "axios";

function quickDecrypt(data, key) { 
    const decrypted = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    return decrypted;
} 

const cachedKeyTemplate = { id: undefined, key: undefined };
function DocumentTable(props) {
    const [secrets, setSecrets] = useState([]);
    
    function matchSecret(id) {
        var idx;
        if (secrets.length !== 0) {
            secrets.forEach((secret, index) => { if (secret.id === id) idx = index })
        }
        return idx;
    }
    const show = props.show;
    const query = props.query;

    function filteredResults() {
        const collection = props.docs.contents;
		const expDates = props.docs.expDates;
        const ids = props.docs.ids;
		const qr = {contents: [], expDates: [], ids: []};
		collection.forEach((document, index) => { 
            const decryptedDoc = {
                fileHash: autoDecrypt(ids[index], document.fileHash),
                fileName: autoDecrypt(ids[index], document.fileName),
                fileType: autoDecrypt(ids[index], document.fileType),
                fileDescription: autoDecrypt(ids[index], document.fileDescription),
                fileSize: document.fileSize,
                recipient: document.recipient,
                uploader: document.uploader,
                uploadTime: document.uploadTime
            };

			const normalized = { 
				hash: decryptedDoc.fileHash,
                name: decryptedDoc.fileName,
                type: decryptedDoc.fileType,
                memo: decryptedDoc.fileDescription,
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
                qr.ids.push(ids[index]); 
                qr.expDates.push(expDates[index]); 
                qr.contents.push(decryptedDoc); 
            }
		});

        return qr; // qr
    }

    const docs = filteredResults();
    const messages = docs.contents;
    const expDates = docs.expDates;
    const ids = docs.ids;

    function autoDecrypt(id, data) {
        var idx;
        if (secrets.length !== 0) {
            secrets.forEach((secret, index) => { if (secret.id === id) idx = index });
            // console.log(secrets[idx].key);
            if (idx !== undefined && idx !== null) return quickDecrypt(data, secrets[idx].key);
            else return data;
        }
        else return data;
    }

    function handleDecryption(id, hash) {
        axios.post("http://localhost:4001/decipher", { hash: hash }, {'Content-Type': 'application/json'})
			.then((res) => {
				if (res.data) {
					setSecrets(prev => [...prev, {id:id, key:res.data}]);
				} else {
					console.log(res);
				}
			});
    }

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
            <th>Index</th>
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
            <td>{ids[index]}</td>
            {show.hash && (<td>{message.fileHash}</td>)}
            {show.name && (<td>{message.fileName}.{message.fileType}</td>)}
            {show.type && (<td>{message.fileType}</td>)}
            {show.memo && (<td>{message.fileDescription}</td>)}
            {show.size && (<td>{props.bytes(message.fileSize.toNumber())}</td>)}
            {show.timestamp && (<td>{timestamp.toLocaleString()}</td>)}
            {show.expiration && (<td>{expDate.toLocaleString()}</td>)}
            {show.from && (<td>{message.uploader}</td>)}
            {show.to && (<td>{message.recipient}</td>)}
            <td>
                {(matchSecret(ids[index]) === undefined || matchSecret(ids[index]) === null) ? (
                    <div 
                    onClick={(event) => {
                        handleDecryption(ids[index], message.fileHash);
                        event.preventDefault();
                    }}
                    >[decrypt]
                    </div>) : (
                    <a 
                    href={`https://ipfs.infura.io/ipfs/${message.fileHash}?filename=${message.fileName}${message.fileType}&download=true`}
                    rel="noopener noreferrer"
                    target="_blank"
                    >[download]
                    </a>)}
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