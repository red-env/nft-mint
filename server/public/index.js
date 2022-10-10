const state = {};

function setLoading(flag) {
    if (flag) {
        document.getElementById('loading').innerText = 'loading...';
    } else {
        document.getElementById('loading').innerText = '';
    }
}

async function init() {
    setLoading(true);
    try {
        state.url = (await (await fetch("/api/endpoint")).json()).endpoint;
        const addresses = await (await fetch("api/contract_addresses")).json();
        state.address = (await ethereum.enable())[0];
        const web3Provider = new Web3.providers.HttpProvider(state.url);
        state.web3 = new Web3(web3Provider);
        state.web3.eth.defaultAccount = state.address;
        state.contract = new state.web3.eth.Contract(await (await fetch("contracts/NFT.json")).json(), addresses.NFT);
        document.getElementById('metadata').textContent = JSON.stringify({
            "name": "...",
            "description": "...",
            "attributes": [
                {
                    "trait_type": "...",
                    "value": "..."
                },
                {
                    "display_type": "number",
                    "trait_type": "...",
                    "value": 0,
                    "max_value": 0,
                }, 
                {
                    "display_type": "date",
                    "trait_type": "Date",
                    "value": (new Date().getTime() / 1000) | 0
                }
            ],
        }, null, '\t');
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
}

async function mint() {
    setLoading(true);
    try {
        const jwt = (await (await (await fetch("/api/web3storage_jwt")).json())).jwt;
        const metadata = JSON.parse(document.getElementById('metadata').textContent);
        if (!state.image && !metadata.image) throw "Insert image url";
        if (!metadata.image) {
            const formImage = new FormData();
            formImage.append('file', state.image);
            const cidImage = (await (await fetch('https://api.web3.storage/upload', {
                method: 'POST', body: formImage, headers: { Authorization: "Bearer " + jwt }
            })).json()).cid;
            metadata.image = `https://${cidImage}.ipfs.dweb.link`;
        }
        const formMetadata = new FormData();
        formMetadata.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        const cidMetadata = (await (await fetch('https://api.web3.storage/upload', {
            method: 'POST', body: formMetadata, headers: { Authorization: "Bearer " + jwt }
        })).json()).cid;
        const metadataLink = `https://${cidMetadata}.ipfs.dweb.link`;
        const trx = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [{ data: state.contract.methods.mint(metadataLink).encodeABI(), from: state.address, to: state.contract._address }],
        });
        console.log(metadataLink);
        console.log(trx);
        window.open(`https://goerli.etherscan.io/tx/${trx}`, '_blank');
    } catch (e) {
        alert(e);
        throw e;
    }
    setLoading(false);
}

document.getElementById('image').addEventListener('change', (event) => {
    state.image = event.target.files[0];
}, false);
init();