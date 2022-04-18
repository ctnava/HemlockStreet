import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import axios from "axios";
import './Dropzone.css';


const chunkSize = 10 * 1024;
const url = 'http://localhost:4001/upload'; 
function Dropzone() {
    const [file, setFile] = useState(null);

    function handleDrop(event) {
        event.preventDefault();
        if (file !== null) {
            if (file.finalName !== null) { // call to delete from server
                const params = new URLSearchParams();
                params.set('fileName', file.finalName);
                axios.delete(url+"?"+params.toString());
            }
        }
        setFile(event.dataTransfer.files[0]);
        setUploaded(false);
    }

    const [chunkIndex, setChunkIndex] = useState(null);
    const [uploaded, setUploaded] = useState(null);

    function readAndUploadChunk() {
        if (file === null) { return }
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
            const chunkNum = chunkIndex + 1; // const progress = (chunkNum / totalChunks) * 100; console.log(`Posting Chunk ${chunkNum} of ${totalChunks} || ${progress}%`);
            axios.post(url, data, {headers}).then(res => {
                const lastChunk = (chunkNum === totalChunks);
                if (lastChunk) {
                    console.log("Document Sent!");
                    file.finalName = res.data.finalName;
                    setUploaded(true);
                    setChunkIndex(null);
                }
                else { setChunkIndex(chunkNum) }
            });
        }

        reader.readAsDataURL(blob);
        reader.onload = (event) => uploadChunk(event);
    }

    useEffect(() => { 
        if(file !== null && chunkIndex === null && uploaded === false) { 
            console.log("Uploading Document...");
            setChunkIndex(0);
        } 
    }, [file, chunkIndex, uploaded]);

    useEffect(() => { if(chunkIndex !== null){readAndUploadChunk()} }, [chunkIndex]);

    function getProgress() {
        const filePresent = (uploaded !== null);
        if (filePresent) {
            if (uploaded === false) {
                const chunks = Math.ceil(file.size / chunkSize);
                return Math.round(((chunkIndex + 1) / chunks) * 100);
            } else { return 100 }
        } else { return 0 }
    }
    
    const [dzActive, setDzActive] = useState(false);
    return(<div>
        <div 
        onDragOver={event => {setDzActive(true); event.preventDefault();}}
        onDragLeave={event => {setDzActive(false); event.preventDefault();}}
        onDrop={handleDrop}
        className={"dropzone" + (dzActive && " active")} 
        >Drop Your File Here!</div>
        { file && (<div className="files">
            <a className="file" target="_blank" href={getProgress() === 100 ? ('http://localhost:4001/uploads/' + file.finalName) : ""}>
                <div className="name">{file.name}</div>
                <div 
                className={"progress" + (getProgress() === 100) && ' done'}
                style={{ width: getProgress().toString() + '%' }}
                >{getProgress()}%</div>
            </a>
        </div>)}
    </div>);
}

export default Dropzone;