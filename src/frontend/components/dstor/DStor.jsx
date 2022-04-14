import React, { useState } from 'react';
import Locating from "../Locating";
import ShowButton from "./ShowButton";
import Upload from "./Upload";
import Downloads from "./Downloads";


function humanBytes(x) {
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   let l = 0, n = parseInt(x, 10) || 0;
   while(n >= 1024 && ++l){n = n/1024;}
   return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}


function DStor(props) {
	const [contract, setContract] = useState();
	const [loading, setLoading] = useState(true);
	const [outbox, setOutbox] = useState([]);
	const [inbox, setInbox] = useState([]);

	const initialize = async () => {
		if (!loading) { setLoading(true); }
		console.log("Querying DStor...");
		const sent = await (contract.sent());
		setOutbox(sent);
		const received = await (contract.received());
		setInbox(received);
		const gasQuote = await contract.gasQuote(1073741824); //bytes/GB
		console.log("perGBperDiem", gasQuote[0].toString());
		console.log("perGBperMonth", gasQuote[1].toString());
		setLoading(false);
	};

	const uploadFile = async (file) => {
		setShowUpload(false);
		setLoading(true);
		contract.upload(file.hash, file.size, file.type, file.name, file.description, file.recipient)
			.then((result) => {
				console.log("transaction", result);
			});
	};

	const [showUpload, setShowUpload] = useState(false);
	const [showDownload, setShowDownload] = useState(false);

	return(<div className="DStor flex justify-center">
		{ loading ? (
			<Locating 
			name="DStor" 
			contract={contract}
			loading={loading}
			loadContract={props.loadContract}
			setContract={setContract}
			initialize={initialize}
			/>
		) : (<div>
			{ showUpload ? (
				<Upload 
				className="panel" 
				ipfs={props.ipfs} 
				bytes={humanBytes} 
				uploadFile={uploadFile} 
				/> 
			) : (
				<ShowButton 
				show={showUpload}
				setShow={setShowUpload}
				message="Upload a File"
				/>
			)}

			<hr/>

			{ showDownload ? (
				<Downloads 
				className="panel" 
				ipfs={props.ipfs} 
				bytes={humanBytes} 
				inbox={inbox} 
				outbox={outbox} 
				/>
			) : (
				<ShowButton 
				show={showDownload}
				setShow={setShowDownload}
				message="Show Available Downloads"
				/>
			)}</div>
		)}
	</div>);
}

export default DStor;