import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import axios from "axios";
import './Dropzone.css';


const chunkSize = 10 * 1024;
const url = 'http://localhost:4001/upload'; 
function Dropzone() {
    const [file, setFile] = useState(null);
    const [chunkIndex, setChunkIndex] = useState(null);
    const [uploaded, setUploaded] = useState(null);
    const [dzActive, setDzActive] = useState(false);
    const [abort, setAbort] = useState([false, false]); // called abort, abort requested
    // console.log("uploaded", uploaded, "chunkIndex", chunkIndex, "fileNotNull", file !== null);

    useEffect(() => { 
        if(file !== null && chunkIndex === null && uploaded === false) { 
            console.log("Uploading Document...");
            setChunkIndex(0);
        } 
        if(file === null) {
            setChunkIndex(null);
            setUploaded(null);
        }
        if(abort[0] === true) {
            if (abort[1] === true) {
                setAbort([false, false]);
                console.log("Resetting...");
            } else {
                setAbort([true, true]);
                console.log("Aborting Upload...");
                const params = new URLSearchParams();
                params.set('fileName', file.tmpName);
                async function sendReq() { await axios.delete(url+"?"+params.toString()).then((res) => {return res}) }
                console.log("Abort Requested...");
                sendReq().then((res) => {
                    console.log("Request Fulfilled...");
                    setFile(null); 
                    console.log("Upload Aborted!");
                });
                
            }
        }
        if(chunkIndex !== null && uploaded !== true) readAndUploadChunk();
    }, [file, chunkIndex, uploaded]);

    async function deletionRequest() {
        if (file !== null) {
            const params = new URLSearchParams();
            if (uploaded === true) { // call to delete from server
                console.log("Requesting Deletion...");
                params.set('fileName', file.finalName);
                await axios.delete(url+"?"+params.toString()).then((res) => {return res});
            } else if (uploaded === false) {
                console.log("Requesting Cancellation...");
                params.set('fileName', file.tmpName);
                await axios.delete(url+"?"+params.toString()).then((res) => {return res});
            } else return "Continuing";
        } else return "Continuing";
    }

    function handleDrop(event) {
        setDzActive(false);
        if (chunkIndex === null) {
            deletionRequest().then((res) => {console.log(res)});
            console.log("Triggering Upload...");
            setFile(event.dataTransfer.files[0]);
            setUploaded(false);
            console.log("Upload Triggered!");
        }
        event.preventDefault();
    }

    function getProgress() {
        const filePresent = (uploaded !== null);
        if (filePresent) {
            if (uploaded === false) {
                const chunks = Math.ceil(file.size / chunkSize);
                return Math.round(((chunkIndex + 1) / chunks) * 100);
            } else { return 100 }
        } else { return 0 }
    }

    function readAndUploadChunk() {
        if (file === null || uploaded === null) { return }
        const reader = new FileReader();
        const start = chunkIndex * chunkSize;
        const from = start;
        const to = from + chunkSize;
        const blob = file.slice(from, to);

        function uploadChunk(event) {
            const headers = {'Content-Type': 'application/octet-stream'};
            const totalChunks = Math.ceil(file.size / chunkSize);
            const dataString = JSON.stringify({
                chunk: event.target.result,
                ext: file.name.split('.').pop(), 
                chunkIndex: chunkIndex,
                totalChunks: totalChunks
            });
            const data = Buffer.from(dataString); 
            const chunkNum = chunkIndex + 1; // console.log(`Posting Chunk ${chunkNum} of ${totalChunks} || ${getProgress()}%`);
            axios.post(url, data, {headers}).then(res => {
                const lastChunk = (chunkNum === totalChunks);
                if (lastChunk) {
                    console.log("Document Sent!");
                    file.finalName = res.data.finalName;
                    setUploaded(true);
                    setChunkIndex(null);
                } else { 
                    if (file.tmpName !== null) { file.tmpName = res.data.tmpName }
                    setChunkIndex(chunkNum); 
                }
            });
        }
        reader.readAsDataURL(blob);
        reader.onload = (event) => uploadChunk(event);
    }

    function deleteFile() {
        deletionRequest().then((res) => {console.log(res)});
        setFile(null);
        setUploaded(null);
    }

    function abortFile() {
        setUploaded(true);
        setAbort([true, false]);
    }

    return(<div>
        <div 
        onDragOver={event => {setDzActive(true); event.preventDefault();}}
        onDragLeave={event => {setDzActive(false); event.preventDefault();}}
        onDrop={handleDrop}
        className={"dropzone" + (dzActive && " active")} 
        >Drop Your File Here!</div>
        { file && (<div className="files">
            <div className="file">
                Please verify that the file was uploaded correctly before proceeding.
                <div>
                    <a className="name" target="_blank" href={getProgress() === 100 ? ('http://localhost:4001/uploads/' + file.finalName) : ""}>{file.name}</a>
                    <span> || </span>
                    { getProgress() !== 100 ? (
                        <span>Progress: {getProgress()}% (please do not refresh the page) || <span onClick={abortFile}>Abort</span></span>
                        ) : (
                        <span onClick={deleteFile}>Delete</span>
                    )}
                </div>
                <div className={"progress" + (getProgress() === 100 && (' done'))} style={{ width: getProgress().toString() + '%' }}>.</div>
            </div>
        </div>)}
    </div>);
}

export default Dropzone;