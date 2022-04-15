import React from 'react';
import Fields from './Fields';
import Query from './Query';
import { Table, Row } from 'react-bootstrap'


function DocumentTable(props) {
    const messages = props.docs.contents;
    const expDates = props.docs.expDates;
    const show = props.show;

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