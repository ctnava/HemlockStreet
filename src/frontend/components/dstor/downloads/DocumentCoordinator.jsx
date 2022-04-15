import React, { useState } from 'react'
import DocumentTable from './DocumentTable';
// import { Table, Form, Row, Col, Button } from 'react-bootstrap'

function DocumentCoordinator(props) {
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
	const [show, setShow] = useState(defaultView);

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
	const [showQueryField, setShowQueryField] = useState(defaultQueryFieldVisibility);

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
	const [query, setQuery] = useState(defaultQuery);
	const [queryResults, setQueryResults] = useState({contents: [], expDates: []});
	function setDefaultQueryResults() { setQueryResults({contents: props.docs.contents, expDates: props.docs.expDates}) }
	if (query === defaultQuery && queryResults.contents.length === 0 && props.docs.contents.length !== 0) {setDefaultQueryResults()}

	function handleQuery(event) {
		const { name, value } = event.target;
        setQuery((prev) => { return {...query, [name]:value} });
		const collection = props.docs.contents;
		const expDates = props.docs.expDates;
		var qr = {contents: [], expDates: []}
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
			// const numFields = ["timestamp", "size"];
			if (!matchedFields.includes(false)) { qr.contents.push(document); qr.expDates.push(expDates[index]); }
		});
		setQueryResults(qr);
		event.preventDefault();
	}

	function resetQuery() {
		setQuery(defaultQuery);
		setShowQueryField(defaultQueryFieldVisibility);
		setDefaultQueryResults();
	}

	console.log(queryResults);

	return(
	<div className="flex justify-center">
		<DocumentTable 
		show={show} 
		setShow={setShow} 
		bytes={props.bytes}
		
		showQueryField={showQueryField}
		setShowQueryField={setShowQueryField}

		query={query}
		resetQuery={resetQuery}
		handleQuery={handleQuery}

		docs={queryResults}
		/>
	</div>
	);
}

export default DocumentCoordinator;
