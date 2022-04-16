import React from "react";
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './frontend/lib/styles.css';
import aesthetics from "./frontend/lib/aesthetics";
import App from './frontend/components/App';
import * as serviceWorker from './serviceWorker';
import { create } from "ipfs-http-client";


const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
ipfs.version().then((version) => { console.log(version, "IPFS Node Ready"); });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App ipfs={ipfs} aesthetics={aesthetics} />);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
