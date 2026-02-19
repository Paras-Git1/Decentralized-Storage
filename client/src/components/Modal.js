import { useEffect } from "react";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import "./Modal.css";

const relay = new GelatoRelay();

const Modal = ({ setModalOpen, contract, provider, account }) => {
  const sharing = async () => {
    const address = document.querySelector(".address").value;
    try {
      const { data } = await contract.populateTransaction.allow(address);
      const request = {
        chainId: window.BigInt(process.env.REACT_APP_CHAIN_ID || "11155111"),
        target: contract.address,
        data: data,
        user: account,
      };
      const signer = provider.getSigner();
      await relay.sponsoredCallERC2771(
        request,
        signer,
        process.env.REACT_APP_GELATO_API_KEY
      );
    } catch (e) {
      console.error(e);
      alert("Failed to share access");
    }
    setModalOpen(false);
  };

  useEffect(() => {
    const accessList = async () => {
      const addressList = await contract.shareAccess();
      let select = document.querySelector("#selectNumber");
      const options = addressList;
      for (let i = 0; i < options.length; i++) {
        let opt = options[i];
        let e1 = document.createElement("option");
        e1.textContent = opt;
        e1.value = opt;
        select.appendChild(e1);
      }
    };
    contract && accessList();
  }, [contract]);

  return (
    <>
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="title">Share with</div>
          <div className="body">
            <input
              type="text"
              className="address"
              placeholder="Enter Address"
            ></input>
          </div>
          <form id="myForm">
            <select id="selectNumber">
              <option className="address">People With Access</option>
            </select>
          </form>
          <div className="footer">
            <button onClick={() => setModalOpen(false)} id="cancelBtn">
              Cancel
            </button>
            <button onClick={() => sharing()}>Share</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
