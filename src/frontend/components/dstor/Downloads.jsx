import React, { useState } from 'react';
import DocumentCoordinator from './downloads/DocumentCoordinator';
import { Row, Col, Button } from 'react-bootstrap'


function Downloads(props) {
	const [showInbox, setShowInbox] = useState(true);
	const [showHidden, setShowHidden] = useState(false);

	return(
		<div className="flex justify-center">
			<Row className="g-4 py-5">
				<Col><h1>{showInbox ? "Inbox" : "Outbox"}{showHidden && " - Hidden"}</h1></Col>
				<Col>
					<Button 
					onClick={() => {setShowInbox(!showInbox)}}
					>{showInbox ? "Show Outbox" : "Show Inbox"}</Button>
					<Button 
					onClick={() => {setShowHidden(!showHidden)}}
					>{showHidden ? "Hide Hidden" : "Show Hidden"}</Button>
				</Col>
			</Row>
			
			<DocumentCoordinator 
			className="panel" 
			ipfs={props.ipfs} 
			bytes={props.bytes} 
			showHidden={showHidden}
			docs={showInbox ? props.inbox : props.outbox} 
			/>
		</div>
	);
}

export default Downloads;
