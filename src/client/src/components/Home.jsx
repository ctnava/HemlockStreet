import React from 'react' //, useEffect, useRef
// import { ethers } from "ethers"
// import Identicon from 'identicon';


function Home(props) {
	return(<div>
		<h1>WELCOME</h1>
		<p>
		If you can read this, you either have metamask or you don't. <br/>
		That's fine, but if you actually want to use the DeadDrop app (aka "dstor") <br/>
		you must install metamask. Other than the app, there is literally nothing here. <br/>
		If you are, in fact, interested in testing this app, make sure you set your network <br/>
		to MUMBAI. If you are NOT on Mumbai, the app will perpetually search for a <br/>
		nonexistent contract and never load because I'm too busy working on the documentation.
		</p>
		<a href="https://medium.com/stakingbits/how-to-connect-polygon-mumbai-testnet-to-metamask-fc3487a3871f">How to add Mumbai to your wallet</a><br/>
		<a href="https://faucet.polygon.technology/">How to get MATIC for transactions</a>
	</div>);
}

export default Home;