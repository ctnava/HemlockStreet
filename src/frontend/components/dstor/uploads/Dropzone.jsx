import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import axios from "axios";
import './Dropzone.css';


const chunkSize = 10 * 1024;
const url = 'http://localhost:4001/upload'; 
function Dropzone(props) {
    const [chunkIndex, setChunkIndex] = useState(null);
    const [dzActive, setDzActive] = useState(false);
    const [abort, setAbort] = useState([false, false]); // called abort, abort requested
    // console.log("props.uploaded", props.uploaded, "chunkIndex", chunkIndex, "fileNotNull", props.fileData !== null);

    useEffect(() => { 
        if(props.fileData !== null && chunkIndex === null && props.uploaded === false) { 
            console.log("Uploading Document...");
            setChunkIndex(0);
        } 

        if(chunkIndex !== null && props.uploaded !== true) readAndUploadChunk();

        if(props.fileData === null) {
            setChunkIndex(null);
            props.setUploaded(null);
        } else  {
            const inputs = props.contractInput;
            const size = props.fileData.size;
            const type = props.fileData.name.split('.')[1];
            const name = props.fileData.name.split('.')[0];
            if (inputs.size === 0 || inputs.type.length === 0 || inputs.name.length === 0
             || inputs.size !== size || inputs.type !== type || inputs.name !== name) {
                props.setContractInput((prev) => {
                    return { ...prev, size: size, type: type, name: name }
                });
                props.getQuote(size);
            }
        }

        if(abort[0] === true) {
            if (abort[1] === true) {
                setAbort([false, false]);
                console.log("Resetting...");
            } else {
                setAbort([true, true]);
                console.log("Aborting Upload...");
                const params = new URLSearchParams();
                params.set('fileName', props.fileData.tmpName);
                async function sendReq() { await axios.delete(url+"?"+params.toString()).then((res) => {return res}) }
                console.log("Abort Requested...");
                sendReq().then((res) => {
                    console.log("Request Fulfilled...");
                    props.setFileData(null); 
                    console.log("Upload Aborted!");
                });
            }
        }
        
    }, [props.fileData, chunkIndex, props.uploaded]);

    async function deletionRequest() {
        if (props.fileData !== null) {
            const params = new URLSearchParams();
            if (props.uploaded === true) { // call to delete from server
                console.log("Requesting Deletion...");
                params.set('fileName', props.fileData.finalName);
                await axios.delete(url+"?"+params.toString()).then((res) => {return res});
            } else if (props.uploaded === false) {
                console.log("Requesting Cancellation...");
                params.set('fileName', props.fileData.tmpName);
                await axios.delete(url+"?"+params.toString()).then((res) => {return res});
            } else return "Continuing";
        } else return "Continuing";
    }

    function handleDrop(event) {
        setDzActive(false);
        const thisFile = event.dataTransfer.files[0];
        if (thisFile.size >= props.min) {
            if (chunkIndex === null) {
                deletionRequest().then((res) => {console.log(res)});
                console.log("Triggering Upload...");
                props.setFileData(thisFile);
                props.setUploaded(false);
                console.log("Upload Triggered!");
            }
        }
        event.preventDefault();
    }

    function getProgress() {
        const filePresent = (props.uploaded !== null);
        if (filePresent) {
            if (props.uploaded === false) {
                const chunks = Math.ceil(props.fileData.size / chunkSize);
                return Math.round(((chunkIndex + 1) / chunks) * 100);
            } else { return 100 }
        } else { return 0 }
    }

    function readAndUploadChunk() {
        if (props.fileData === null || props.uploaded === null) { return }
        const reader = new FileReader();
        const start = chunkIndex * chunkSize;
        const from = start;
        const to = from + chunkSize;
        const blob = props.fileData.slice(from, to);

        function uploadChunk(event) {
            const headers = {'Content-Type': 'application/octet-stream'};
            const totalChunks = Math.ceil(props.fileData.size / chunkSize);
            const dataString = JSON.stringify({
                chunk: event.target.result,
                ext: props.fileData.name.split('.').pop(), 
                chunkIndex: chunkIndex,
                totalChunks: totalChunks
            });
            const data = Buffer.from(dataString); 
            const chunkNum = chunkIndex + 1; // console.log(`Posting Chunk ${chunkNum} of ${totalChunks} || ${getProgress()}%`);
            axios.post(url, data, {headers}).then(res => {
                const lastChunk = (chunkNum === totalChunks);
                if (lastChunk) {
                    console.log("Document Sent!");
                    props.fileData.finalName = res.data.finalName;
                    props.setUploaded(true);
                    setChunkIndex(null);
                } else { 
                    if (props.fileData.tmpName !== null) { props.fileData.tmpName = res.data.tmpName }
                    setChunkIndex(chunkNum); 
                }
            });
        }
        reader.readAsDataURL(blob);
        reader.onload = (event) => uploadChunk(event);
    }

    function deleteFile() {
        deletionRequest().then((res) => {console.log(res)});
        props.setFileData(null);
        props.setUploaded(null);
    }

    function abortFile() {
        props.setUploaded(true);
        setAbort([true, false]);
    }

    return(<div>
        { props.uploaded === null && (<div 
            onDragOver={event => {setDzActive(true); event.preventDefault();}}
            onDragLeave={event => {setDzActive(false); event.preventDefault();}}
            onDrop={handleDrop}
            className={"dropzone" + (dzActive ? " active" : "")} 
            >
                Drop Your file Here! (Min. {props.bytes(props.min)})
        </div>)}
        { props.fileData && (<div className="files">
            <div className="file">
                <p>{props.pinningRate}</p>
                <hr/>
                <p>First Month (to start) || ${(props.quote.bench / (10 ** 8))} USD as ~{(props.quote.gasBench) / (10 ** 18)} Tokens</p>
                <p>Every Day After || ${(props.quote.perDiem / (10 ** 8))} USD as ~{(props.quote.gasPerDiem / (10 ** 18))} Tokens</p>
            </div>
            <div className="file">
                <p>Please verify that the file was uploaded correctly before proceeding.</p>
                <p>Projected Cost ({props.bytes(props.contractInput.size)}) || ${props.getProjectedCost("usd")} USD as ~{props.getProjectedCost("gas")} Tokens</p>
                {props.hash.length !== 0 && (<div>IPFS CID: {props.hash}</div>)}
                    
                <p>
                    <a className="name" target="_blank" href={getProgress() === 100 ? ('http://localhost:4001/uploads/' + props.fileData.finalName) : ""}>{props.fileData.name}</a>
                    <span> || </span>
                    { getProgress() !== 100 ? (
                        <span>Progress: {getProgress()}% (please do not refresh the page) || <span onClick={abortFile}>Abort</span></span>
                        ) : (
                        <span onClick={deleteFile}>Delete</span>
                    )}
                </p>
                <hr/>
                
                <div className={"progress" + (getProgress() === 100 && (' done'))} style={{ width: getProgress().toString() + '%' }}>.</div>
            </div>
        </div>)}
    </div>);
}

export default Dropzone;