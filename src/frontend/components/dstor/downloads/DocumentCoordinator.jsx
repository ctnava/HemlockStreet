import React, { useState } from 'react'
import DocumentTable from './DocumentTable';
// import { Table, Form, Row, Col, Button } from 'react-bootstrap'

function DocumentCoordinator(props) {
	const showHidden = props.showHidden;
	
	const defaultView = {
		fields: false,
		name: true,
		type: false,
		memo: true,
		hash: false,
		timestamp: true,
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
		size: "",
		from: "",
		to: ""
	}
	const [query, setQuery] = useState(defaultQuery);

	function filterDocs() {
		const results = props.docs.filter((document) => { 
			const strFields = ["name", "type", "memo", "hash", "from", "to"];
			var matchedFields = [];
			strFields.forEach((field) => {matchedFields.push(query[field] !=="" ? true : false)});			
			strFields.forEach((field, index) => {
				if (!matchedFields[index]) { 
					if (document[field].includes(query[field])) { 
						matchedFields[index] = true; 
					} 
				}
			});
			console.log(matchedFields);
			// const numFields = ["timestamp", "size"];

			if (!matchedFields.includes(false)) { return document; }
		});
		return results;
	}

	function handleQuery(event) {
		const { name, value } = event.target;
        setQuery(prev => {
            return {...query, [name]:value};
        });
        event.preventDefault();
		filterDocs();
	}

	function resetQuery() {
		setQuery(defaultQuery);
		setShowQueryField(defaultQueryFieldVisibility);
	}

	const [visibleDocs, setVisibleDocs] = useState();
	const [hiddenDocs, setHiddenDocs] = useState([]);
	const docsToShow = (showHidden) ? hiddenDocs : visibleDocs;
	console.log(docsToShow);
	
	
	// function hide(event) {
	// 	setHidden(prev => [...prev, event.target.hash]);
	// 	setDocuments((prev) => {
	// 		return documents.filter();
	// 	});
	// }

	return(
	<div className="flex justify-center">
		<DocumentTable 
		name={showHidden ? "hidden" : "visible"} 
		show={show} 
		setShow={setShow} 
		
		showQueryField={showQueryField}
		setShowQueryField={setShowQueryField}

		query={query}
		resetQuery={resetQuery}
		handleQuery={handleQuery}

		docs={props.docs/*showHidden ? hiddenDocs : visibleDocs*/}
		/>
	</div>
	);
}

export default DocumentCoordinator;
