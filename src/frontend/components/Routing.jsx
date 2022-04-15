import React from "react";
import { Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import Home from "./Home";
import DStor from "./dstor/DStor";


function Routing(props) {
    const client = props.client; 
    console.log(`Detected account (active): \n${client.account}`);
    console.log(`ChainId: ${parseInt(client.chainId, 16)}`);

    const loadContract = async (byName) => {
        const signer = client.provider.getSigner();
        var metadata = { name: null, abi: null, address: null };
        await import(`../contractsData/${parseInt(client.chainId, 16)}/${byName}.json`)
            .then(async (contractInterface) => {
                await import(`../contractsData/${parseInt(client.chainId, 16)}/${byName}-address.json`)
                    .then((addressMap) => { metadata = { name: byName, abi: contractInterface.abi, address: addressMap.address }; })
                    .catch((err) => console.error(err));
            }).catch((err) => console.error(err));

        console.log(`Located ${byName} at ${metadata.address}`);
        const thisContract = new ethers.Contract(metadata.address, metadata.abi, signer);
        return thisContract;
    };

    return(
        <Routes>
            <Route path="/" element={<Home />} />

            { props.client.account && (
                <Route path="/dstor" element={ <DStor ipfs={props.ipfs} loadContract={loadContract} client={props.client} /> } />
            )}

            {/* !props.client.account && (
                <Route path="/dapps" element={ <Dapps /> } />
            )*/}
            
        </Routes>
    );
}

export default Routing;