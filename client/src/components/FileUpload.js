import { useState } from "react";
import axios from "axios";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import "./FileUpload.css";

const relay = new GelatoRelay();

const FileUpload = ({ contract, account, provider }) => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("No image selected");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                const ImgHash = `ipfs://${resFile.data.IpfsHash}`;

                const { data } = await contract.populateTransaction.add(account, ImgHash);
                const request = {
                    chainId: window.BigInt(process.env.REACT_APP_CHAIN_ID || "11155111"),
                    target: contract.address,
                    data: data,
                    user: account,
                };

                const signer = provider.getSigner();
                const response = await relay.sponsoredCallERC2771(
                    request,
                    signer,
                    process.env.REACT_APP_GELATO_API_KEY
                );

                alert(`Successfully Uploaded! Task: ${response.taskId}`);
                setFileName("No image selected");
                setFile(null);
            } catch (e) {
                console.error(e);
                alert("Unable to upload image");
            }
        }
    };

    const retrieveFile = (e) => {
        const data = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () => {
            setFile(e.target.files[0]);
            e.preventDefault();
        };
        setFileName(e.target.files[0].name);
        e.preventDefault();
    };

    return (
        <div className="top">
            <form className="form" onSubmit={handleSubmit}>
                <label htmlFor="file-upload" className="choose">
                    Choose Image
                </label>
                <input
                    disabled={!account}
                    type="file"
                    id="file-upload"
                    name="data"
                    onChange={retrieveFile}
                />
                <span className="textArea">Image: {fileName}</span>
                <button type="submit" className="upload" disabled={!file}>
                    Upload Image
                </button>
            </form>
        </div>
    );
};

export default FileUpload;
