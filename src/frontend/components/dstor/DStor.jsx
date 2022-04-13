import React, { useState } from 'react'
import Locating from "../Locating";
import ShowButton from "./ShowButton";
import Upload from "./Upload";
import Downloads from "./Downloads";


function DStor(props) {
	const [contract, setContract] = useState();
	const [loading, setLoading] = useState(true);
	const [docs, setDocs] = useState([]);

	const initialize = async () => {
		if (!loading) { setLoading(true); }
		console.log("Querying DStor...");
		const sent = await (contract.getAccessibleFileIds(true));
		const documents = []
		await sent.forEach((doc) => { contract.get(doc).then((result) => {documents.push(result)})});
		setDocs(documents);
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

	return(
		<div className="DStor flex justify-center">
			<div className="px-5 container">
			{loading && (
				<Locating 
				name="DStor" 
				contract={contract}
				loading={loading}
				loadContract={props.loadContract}
				setContract={setContract}
				initialize={initialize}
				/>
			)}


			{!loading && (
			<div>
				<ShowButton 
				show={showUpload}
				setShow={setShowUpload}
				message="Upload a File"
				/>

				{showUpload && (<Upload ipfs={props.ipfs} uploadFile={uploadFile} />)}

				<hr/>

				<ShowButton 
				show={showDownload}
				setShow={setShowDownload}
				message="Show Available Downloads"
				/>

				{showDownload && (<Downloads ipfs={props.ipfs} docs={docs} />)}
			</div>
			)}
			</div>
		</div>
	);
}

export default DStor;
