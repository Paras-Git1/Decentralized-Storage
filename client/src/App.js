import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Magic } from "magic-sdk";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, {
  network: {
    rpcUrl: process.env.REACT_APP_RPC_URL,
    chainId: parseInt(process.env.REACT_APP_CHAIN_ID || "11155111"),
  },
});

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWallet = async () => {
    const web3Provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
    setProvider(web3Provider);
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    if (contractAddress && ethers.utils.isAddress(contractAddress)) {
      const uploadContract = new ethers.Contract(contractAddress, Upload.abi, signer);
      setContract(uploadContract);
    } else {
      console.warn("Contract address not set or invalid. Deploy contract and update REACT_APP_CONTRACT_ADDRESS.");
    }
  };

  const login = async () => {
    if (!email) return alert("Please enter your email");
    setIsLoading(true);
    try {
      await magic.auth.loginWithEmailOTP({ email });
      await loadWallet();
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  const logout = async () => {
    await magic.user.logout();
    setAccount("");
    setContract(null);
    setProvider(null);
  };

  useEffect(() => {
    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) loadWallet();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!modalOpen && account && (
        <button className="share" onClick={() => setModalOpen(true)}>
          Share
        </button>
      )}
      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract} provider={provider} account={account} />
      )}
      <div className="App">
        <h1 style={{ color: "white" }}>Decentralized Storage</h1>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>
        {!account ? (
          <div style={{ marginTop: "2rem" }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                marginRight: "8px",
                fontSize: "14px",
              }}
            />
            <button onClick={login} disabled={isLoading} className="upload">
              {isLoading ? "Logging in..." : "Login with Email"}
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: "white" }}>Account: {account}</p>
            <button
              onClick={logout}
              className="upload"
              style={{ marginBottom: "1rem" }}
            >
              Logout
            </button>
            <FileUpload account={account} provider={provider} contract={contract} />
            <Display contract={contract} account={account} />
          </>
        )}
      </div>
    </>
  );
}

export default App;
