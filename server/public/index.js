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
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
}

function addLinks(links) {
    const links_item = document.getElementById("links");
    links_item.childNodes.forEach(c => links_item.removeChild(c));
    for (const {label, url} of links) {
        const div = document.createElement("div");
        const a = document.createElement("a");
        a.href = url;
        a.innerText = label || url;
        a.target = '_blank';
        div.appendChild(a);
        links_item.appendChild(div);
    }
}

function createLabelValue(attribute, label, value, class_name) {
    const label_value = document.createElement("label");
    label_value.innerText = label;
    attribute.appendChild(label_value);
    const input_value = document.createElement("input");
    input_value.type = value;
    input_value.className = class_name;
    attribute.appendChild(input_value);
}

function addItem() {
    const attributes = document.getElementById("attributes");
    const attribute = document.createElement("div");
    attribute.innerHTML = `
        <button>remove</button>
        <label>Type</label>
        <select>
            <option value="text">text</option>
            <option value="number">number</option>
            <option value="date">date</option>
        </select>
        <label>Key</label>
        <input class="key" type="text">`;
    const span = document.createElement("span");
    attribute.appendChild(span);
    createLabelValue(span, "Value", "text", "value");
    const select = attribute.getElementsByTagName("select")[0];
    select.onchange = (ev) => { 
        const value = ev.target.value;
        span.innerHTML = "";
        createLabelValue(span, "Value", value, "value");
        if (value == 'number') {
            createLabelValue(span, "Max value", "number", "max_value");
        };
    };
    const button = attribute.getElementsByTagName("button")[0];
    button.onclick = () => attributes.removeChild(attribute);
    attributes.appendChild(attribute);
}

function getElByClass(attribute=document.createElement(), class_name) {
    for (let i = 0; i < attribute.children.length; i++) {
        const item = attribute.children[i];
        if (item.tagName == "SPAN") {
            for (let j = 0; j < item.children.length; j++) {
                const sub_item = item.children[j];
                if (sub_item.className == class_name) {
                    return sub_item;
                }
            }
        } else {
            if (item.className == class_name) {
                return item;
            }
        }
    }
}

function getFormattedItem(attribute) {
    const key = getElByClass(attribute, "key").value;
    const value_element = getElByClass(attribute, "value");
    const value = value_element.value;
    const item = {
        trait_type: key,
        value,
    }
    const type = value_element.type;
    if (type != "text") {
        item.display_type = type;
    }
    if (type == "number") {
        const max_value = getElByClass(attribute, "max_value").value;
        if (max_value.length > 0 && Number.parseFloat(max_value) > Number.parseFloat(value)) {
            item.max_value = max_value;
        }
    } else if (type == "date") {
        item.value = (new Date(item.value).getTime() / 1000) | 0;
    }
    return item;
}

function getJsonMetadata() {
    const attributes = document.getElementById("attributes");
    const metadata = {
        name: document.getElementById('name').value,
        attributes: []
    };
    for (let i = 0; i < attributes.children.length; i++) {
        metadata.attributes.push(getFormattedItem(attributes.children[i]));
    }
    const description = document.getElementById('description').value;
    if (description) {
        metadata.description = description;
    }
    return metadata;
}

async function mint() {
    setLoading(true);
    try {
        const jwt = (await (await (await fetch("/api/web3storage_jwt")).json())).jwt;
        const metadata = getJsonMetadata();
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
        addLinks([
            {
                label: "transaction",
                url: `https://goerli.etherscan.io/tx/${trx}`
            }, {
                label: "metadata link",
                url: metadataLink
            }]);
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