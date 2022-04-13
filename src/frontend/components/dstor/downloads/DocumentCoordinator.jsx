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

	const [visibleDocs, setVisibleDocs] = useState(props.docs);
	const [hiddenDocs, setHiddenDocs] = useState([]);
	
	
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
		setQuery={setQuery}

		docs={showHidden ? hiddenDocs : visibleDocs}
		/>
	</div>
	);
}

export default DocumentCoordinator;
