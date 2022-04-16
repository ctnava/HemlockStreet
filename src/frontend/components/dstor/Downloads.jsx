import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap'
import DocumentTable from './downloads/DocumentTable';


const defaultQuery = {
	name: "",
	type: "",
	memo: "",
	hash: "",
	timestamp: "",
	expiration: "",
	size: "",
	from: "",
	to: ""
}

const defaultQueryFieldVisibility = {
	name: false,
	type: false,
	memo: false,
	hash: false,
	timestamp: false,
	expiration: false,
	size: false,
	from: false,
	to: false
}

const defaultView = {
	fields: false,
	name: true,
	type: false,
	memo: true,
	hash: false,
	timestamp: true,
	expiration: true,
	size: false,
	from: false,
	to: false
}

function Downloads(props) {
	const [show, setShow] = useState(defaultView);
	const [showQueryField, setShowQueryField] = useState(defaultQueryFieldVisibility);

	const [showInbox, setShowInbox] = useState(true);
	const [query, setQuery] = useState(defaultQuery);

	function switchMessages() {
		setShowInbox(!showInbox);
		resetQuery();
	}
	
	function resetQuery() {
		setQuery(defaultQuery);
		setShowQueryField(defaultQueryFieldVisibility);
	}
	
	function handleQuery(event) {
		const { name, value } = event.target;
        setQuery((prev) => { return {...query, [name]:value} });
		event.preventDefault();
	}

	return(
		<div className="flex justify-center">
			<Row className="g-4 py-5">
				<Col><h1>{showInbox ? "Inbox" : "Outbox"}</h1></Col>
				<Col>
					<Button 
					onClick={switchMessages}
					>{showInbox ? "Show Outbox" : "Show Inbox"}</Button>
				</Col>
			</Row>

			<DocumentTable 
			ipfs={props.ipfs} 
			bytes={props.bytes}

			show={show} 
			setShow={setShow} 
			
			showQueryField={showQueryField}
			setShowQueryField={setShowQueryField}

			query={query}
			resetQuery={resetQuery}
			handleQuery={handleQuery}

			docs={showInbox ? props.inbox : props.outbox}
			/>
		</div>
	);
}

export default Downloads;
