import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap'
import DocumentTable from './downloads/DocumentTable';


const defaultEnd = new Date();
const defaultQuery = {
	name: "",
	type: "",
	memo: "",
	hash: "",
	timestamp: {start: new Date("2020/03/13"), end: defaultEnd},
	expiration: {start: new Date("2020/03/13"), end: defaultEnd},
	size: {min: 0, max: 1024, units: 'YB' },
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

	function handleSizeQuery(event) {
		const { name, value } = event.target;
		setQuery((prev) => { return {...query, size: {...query.size, [name]: value } } });
		if (name !== "units") { event.preventDefault() }
	}

	function handleDateQuery(event) {
		const { name, part, selected } = event.target;
		const dateRange = query[name];
		const newRange = {...dateRange, [part]: selected};
		setQuery((prev) => { return {...query, [name]: newRange} });
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
			handleSizeQuery={handleSizeQuery}
			handleDateQuery={handleDateQuery}
			defaultEnd={defaultEnd}

			docs={showInbox ? props.inbox : props.outbox}
			/>
		</div>
	);
}

export default Downloads;
