import React from 'react';
import Fields from './Fields';
import Query from './Query';
import { Table, Row } from 'react-bootstrap'


function DocumentTable(props) {
    const docs = props.docs;
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
            {show.from && (<th>Sender</th>)}
            {show.to && (<th>Receiver</th>)}
            <th>Actions</th>
        </tr>
    </thead>
    
    <tbody>
        { docs.map((doc, index) => {
            var timestamp = doc.uploadTime.toNumber();
            const toMs = timestamp * 1000;
            timestamp = new Date(toMs); 
            return(
        <tr key={index}>
            {show.hash && (<td>{doc.fileHash}</td>)}
            {show.name && (<td>{doc.fileName}{doc.fileType}</td>)}
            {show.type && (<td>{doc.fileType}</td>)}
            {show.memo && (<td>{doc.fileDescription}</td>)}
            {show.size && (<td>{props.bytes(doc.fileSize.toNumber())}</td>)}
            {show.timestamp && (<td>{timestamp.toLocaleString()}</td>)}
            {show.from && (<td>{doc.uploader}</td>)}
            {show.to && (<td>{doc.recipient}</td>)}
            <td>
                <div>hide</div> / 
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
    {docs.length === 0 && (<p>No documents found.</p>)}
    </Row>
    );
}

export default DocumentTable;