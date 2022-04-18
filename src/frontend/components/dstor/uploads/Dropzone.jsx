import React, {useEffect, useState} from "react";
import axios from "axios";
import './Dropzone.css';


const chunkSize = 10 * 1024;

function Dropzone() {
    const [file, setFile] = useState(null);

    function handleDrop(event) {
        event.preventDefault();
        setFile(event.dataTransfer.files[0]);
        if(uploaded) { setUploaded(false) }
    }

    const [chunkIndex, setChunkIndex] = useState(null);
    const [uploaded, setUploaded] = useState(false);

    function readAndUploadChunk() {
        if (file === null) { return }
        const reader = new FileReader();
        const start = chunkIndex * chunkSize;
        const from = start;
        const to = from + chunkSize;
        const blob = file.slice(from, to);

        function uploadChunk(event) {
            const data = event.target.result;
            const params = new URLSearchParams();
            params.set('name', file.name);
            params.set('size', file.size);
            params.set('chunkIndex', chunkIndex);
            const totalChunks = Math.ceil(file.size / chunkSize);
            params.set('totalChunks', totalChunks);
            const url = 'http://localhost:4001/upload?' + params.toString();
            const headers = {'Content-Type': 'application/octet-stream'};
            console.log(`Posting Chunk ${chunkIndex+1} of ${totalChunks} || ${((chunkIndex+1)/totalChunks)*100}%`);
            axios.post(url, data, {headers}).then(res => {
                const lastChunk = (chunkIndex === totalChunks - 1);
                if (lastChunk) {
                    console.log("File Uploaded!");
                    setUploaded(true);
                    setChunkIndex(null);
                }
                else {setChunkIndex(chunkIndex+1)}
            });
        }

        reader.readAsDataURL(blob);
        reader.onload = (event) => uploadChunk(event);
    }

    useEffect(() => { 
        if(file !== null && chunkIndex === null && !uploaded) { 
            console.log("Uploading File...");
            setChunkIndex(0);
        } 
    }, [file, chunkIndex, uploaded]);

    useEffect(() => { if(chunkIndex !== null){readAndUploadChunk()} }, [chunkIndex]);
    
    const [dzActive, setDzActive] = useState(false);

    return(<div 
    onDragOver={event => {setDzActive(true); event.preventDefault();}}
    onDragLeave={event => {setDzActive(false); event.preventDefault();}}
    onDrop={handleDrop}
    className={"dropzone" + (dzActive && " active")} 
    >
    Drop Your File Here!
    </div>);
}

export default Dropzone;