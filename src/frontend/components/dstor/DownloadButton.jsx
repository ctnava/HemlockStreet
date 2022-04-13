import React, { useState } from 'react'

function DownloadButton(props) {
	const [buffering, setBuffering] = useState(false);
	const ipfs = props.ipfs;
	const href = 
		`https://ipfs.infura.io/ipfs/${props.doc.fileHash}?
		filename=${props.doc.fileName}${props.doc.fileType}&
		download=true`;


	async function bufferDownload() {
		setBuffering(true);
		ipfs.get(props.fileHash, (err, file) => {
			if (err) { console.log(err) }
			else {
				console.log();
			}
		});
	}

	return(
	<div>
	{buffering ? (
		<span>buffering</span>
	) : (
		<span
		onClick={bufferDownload}
		>download</span>
	)}
	</div>
	);
} 

export default DownloadButton;