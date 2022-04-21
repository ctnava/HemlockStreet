import React, { useState } from 'react';
import { ethers } from "ethers";
import Admin from "./Admin";
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
	const messageBox = {
		contents: [],
		expDates: []
	};
	const [outbox, setOutbox] = useState(messageBox);
	const [inbox, setInbox] = useState(messageBox);
	const adminDefault = {
		show: false,
		balance: 0,
		fsMin: 0,
		pinMin: 0,
		pinRate: 0,
		fission: ""
	}
	const [adminDetails, setAdminDetails] = useState(adminDefault);

	const initialize = async () => {
		if (!loading) { setLoading(true); }
		console.log("Querying DStor...");
		const [sent, sentExps, received, receivedExps] = await contract.getAllData();
		const ownerAddress = await contract.owner();
		setOutbox({ contents: sent, expDates: sentExps });
		setInbox({ contents: received, expDates: receivedExps });
		if (ownerAddress.toLowerCase() === props.client.account) { 
			const balance = await (props.client.provider).getBalance(contract.address);
			const fsMin = await contract.minimumFileSize();
			const pinMin = await contract.minimumPin();
			const pinRate = await contract.pinningRate();
			const fission = await contract.fissionEngine();
			setAdminDetails({
				show: true,
				balance: balance,
				fsMin: fsMin,
				pinMin: pinMin,
				pinRate: pinRate,
				fission: fission
			});
		}
		await getRules();
		setLoading(false);
	};

	const uploadFile = async (file, msgValue) => {
		setShowUpload(false);
		setLoading(true);
		const val = ethers.utils.parseUnits(msgValue.toString(), "wei");
		console.log(val);
		contract.upload(file.hash, file.size, file.type, file.name, file.description, file.recipient, { value: val })
			.then((result) => {
				console.log("transaction", result);
			});
	};

	const getQuotes = async (size) => {
		const [perDiem, bench] = await contract.quote(size);
		const [gasPerDiem, gasBench] = await contract.gasQuote(size);
		return [perDiem, bench, gasPerDiem, gasBench];
	}

	const defaultRules = {
		name: "",
		pinningRate: "",
		minimumPin: 0,
		minimumFileSize: 0,
	}
	const [rules, setRules] = useState(defaultRules);

	const getRules = async () => {
		const name = await contract.name();
		const pinningRate = (await contract.pinningRate()).toString();
		const monthly = `${pinningRate.slice(0, pinningRate.length - 2)}.${pinningRate.slice(-2)}`;
		const daily = (parseInt(monthly) / 30).toString();
		const pinQuote = ("Storage at $"+monthly+" per GB per Month and then $"+daily.slice(0, daily.indexOf(".")+9)+" per day after!");
		const minimumPin = await contract.minimumPin();
		const pin = minimumPin.toString();
		const minimumFileSize = await contract.minimumFileSize();
		const fsMin = minimumFileSize.toString();
		const ruleSet = {
			name: name,
			pinningRate: pinQuote,
			minimumPin: parseInt(pin),
			minimumFileSize: parseInt(fsMin)
		}
		setRules(ruleSet);
		return ruleSet;
	}
	

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
			{ adminDetails.show && (<Admin contract={contract} details={adminDetails} />)}

			{ showUpload ? (
				<Upload 
				className="panel" 
				client={props.client}
				contract={contract}
				rules={rules}
				getQuotes={getQuotes}
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
