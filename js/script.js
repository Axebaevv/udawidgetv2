// --- API Configuration ---
// MODIFICATION: Changed to 'let' and set as placeholder.
// If you have an API key, paste it here to hide the API key input field.

// --- API Configuration ---
const ENCLAVE_API_KEY = 'PASTE_YOUR_ENCLAVE_API_KEY_HERE';
const API_ENDPOINT = 'https://api.enclave.money/unified-deposit-address/create';

// --- Static Data ---
const TOKEN_DATA = {
    USDC: {
        '8453': { name: 'Base', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', color: 'linear-gradient(135deg, #0052ff 0%, #4c8cff 100%)' },
        '42161': { name: 'Arbitrum', address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', color: 'linear-gradient(135deg, #28a0f0 0%, #4dabf7 100%)' },
        '43114': { name: 'Avalanche', address: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', color: 'linear-gradient(135deg, #e84142 0%, #ff6b6b 100%)' },
        '792703809': { name: 'Solana', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', color: 'linear-gradient(135deg, #14f195 0%, #9945ff 100%)' },
        '1': { name: 'Ethereum', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', color: 'linear-gradient(135deg, #627eea 0%, #8c9eff 100%)' },
        '10': { name: 'Optimism', address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', color: 'linear-gradient(135deg, #ff0420 0%, #ff5c5c 100%)' },
        '137': { name: 'Polygon', address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', color: 'linear-gradient(135deg, #8247e5 0%, #a855f7 100%)' },
        '56': { name: 'BSC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', color: 'linear-gradient(135deg, #f3ba2f 0%, #ffd166 100%)' }
    },
    SOL: {
        '792703809': { name: 'Solana', address: 'So11111111111111111111111111111111111111111', color: 'linear-gradient(135deg, #14f195 0%, #9945ff 100%)' }
    },
    OTHERS: {}
};
const CHAIN_NAMES = { '1': 'Ethereum', '10': 'Optimism', '56': 'BSC', '130': 'Unichain', '137': 'Polygon', '146': 'Sonic', '480': 'Worldchain', '8453': 'Base', '42161': 'Arbitrum', '43114': 'Avalanche', '792703809': 'Solana' };

// --- DOM Elements ---
const walletInput = document.getElementById('walletAddress');
const addressTypeBadge = document.getElementById('addressTypeBadge');
const chainSelect = document.getElementById('chainSelect');
const tokenInput = document.getElementById('tokenAddress');
const generateBtn = document.getElementById('generateBtn');
const addressesContainer = document.getElementById('addressesContainer');
const evmAddressDisplay = document.getElementById('evmAddress');
const solanaAddressDisplay = document.getElementById('solanaAddress');
const evmQrCodeContainer = document.getElementById('evmQrCode');
const solanaQrCodeContainer = document.getElementById('solanaQrCode');
const selectedChainText = document.getElementById('selectedChainText');
const openRefBtn = document.getElementById('openRefBtn');
const tokenRefModal = document.getElementById('tokenRefModal');
const closeTokenRefModal = document.getElementById('closeTokenRefModal');
const tokenTableBody = document.getElementById('tokenTableBody');
const tableContainer = document.getElementById('tableContainer');
const emptyState = document.getElementById('emptyState');
const modalTitle = document.getElementById('modalTitle');
const tokenButtons = document.querySelectorAll('.token-btn');
const statusMessage = document.getElementById('statusMessage');
const advancedSettings = document.getElementById('advancedSettings');
const advancedToggleBtn = document.getElementById('advancedToggleBtn');
const copyInstructionModal = document.getElementById('copyInstructionModal');
const closeCopyModal = document.getElementById('closeCopyModal');
const copyModalTitle = document.getElementById('copyModalTitle');
const copyModalContent = document.getElementById('copyModalContent');
const acknowledgeCopyBtn = document.getElementById('acknowledgeCopyBtn');
const finalCopyBtn = document.getElementById('finalCopyBtn');
const chainsModal = document.getElementById('chainsModal');
const closeChainsModal = document.getElementById('closeChainsModal');


let currentToken = 'USDC';
let detectedAddressType = null;

// --- Main Functions ---

async function handleGenerateClick(isMock = false) {
    const address = walletInput.value.trim();
    const token = tokenInput.value.trim();
    const selectedChainId = chainSelect.value;
    const isSolanaDestination = selectedChainId === '792703809';

    // Initial Validation
    if (!address) { setStatus('Please enter your wallet address', true); return; }
    if (!detectedAddressType) { setStatus('Please enter a valid wallet address', true); return; }
    if (!token) { setStatus('Please enter a valid token contract address', true); return; }

    if (isSolanaDestination && detectedAddressType !== 'SOLANA') {
        setStatus("Destination is Solana, so 'Receive To' must be a Solana address.", true);
        return;
    }
    if (!isSolanaDestination && detectedAddressType !== 'EVM') {
        setStatus("Destination is an EVM chain, so 'Receive To' must be an EVM address (0x...).", true);
        return;
    }

    if (ENCLAVE_API_KEY === 'PASTE_YOUR_ENCLAVE_API_KEY_HERE' && !isMock) {
        setStatus('API Key is missing. Generating MOCK addresses.', true);
        isMock = true;
    }

    setStatus(isMock ? 'Generating MOCK addresses...' : 'Generating REAL addresses from API...');
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    try {
        let udaData;
        if (isMock) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            udaData = {
                evmAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                solanaAddress: 'So1' + Array(41).fill(0).map(() => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('')
            };
        } else {
            udaData = await getUdaFromApi();
        }

        if (udaData && udaData.evmAddress && udaData.solanaAddress) {
            displayUdaResults(udaData);
            setStatus('Deposit addresses generated successfully!', false);
        } else {
            throw new Error('Invalid or incomplete response from API.');
        }
    } catch (error) {
        console.error('Error generating UDA:', error);
        setStatus(`Error: ${error.message}`, true);
        addressesContainer.classList.add('hidden');
    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
}

async function getUdaFromApi() {
    const userId = 'user-' + crypto.randomUUID();
    const requestPayload = {
        userId: userId,
        destinationChainId: parseInt(chainSelect.value, 10),
        destinationAddress: walletInput.value.trim(),
        destinationTokenAddress: tokenInput.value.trim()
    };

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ENCLAVE_API_KEY
        },
        body: JSON.stringify(requestPayload)
    });

    const responseData = await response.json();
    console.log('Full API Response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
        const errorMessage = responseData.error || `API Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
    }
    
    const udaData = responseData.data;

    if (!udaData || !udaData.depositAddresses) {
            throw new Error("API response is missing the 'data' or 'depositAddresses' object.");
    }
    
    const evmDepositArray = udaData.depositAddresses.evm_deposit_address;
    const solanaDepositObject = udaData.depositAddresses.solana_deposit_address;
    const evmAddress = evmDepositArray && evmDepositArray.length > 0 ? evmDepositArray[0].contractAddress : null;
    const solanaAddress = solanaDepositObject ? solanaDepositObject.address : null;

    if (!evmAddress || !solanaAddress) {
        throw new Error("Could not find address fields in the API response. Check console for the full response from the server.");
    }

    return {
        evmAddress: evmAddress,
        solanaAddress: solanaAddress
    };
}

function displayUdaResults(udaData) {
    evmAddressDisplay.textContent = udaData.evmAddress;
    solanaAddressDisplay.textContent = udaData.solanaAddress;
    
    generateQRCode(udaData.evmAddress, evmQrCodeContainer);
    generateQRCode(udaData.solanaAddress, solanaQrCodeContainer);
    
    // Reset QR code revealed state
    document.querySelectorAll('.qr-code-wrapper').forEach(el => el.classList.remove('revealed'));

    addressesContainer.classList.remove('hidden');
    
    setTimeout(() => {
        addressesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// --- UI & Helper Functions ---

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
}

function generateQRCode(text, container) {
    container.innerHTML = '';
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const img = document.createElement('img');
    img.src = qr.createDataURL(4);
    container.appendChild(img);
}

function detectAddressType(address) {
    if (!address) return null;
    if (address.startsWith('0x') && address.length === 42) return 'EVM';
    if (!address.startsWith('0x') && address.length >= 32 && address.length <= 44) {
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
        if (base58Regex.test(address)) return 'SOLANA';
    }
    return null;
}

function updateAddressTypeBadge(type) {
    if (type === 'EVM') {
        addressTypeBadge.innerHTML = '<span class="address-type-badge badge-evm">EVM</span>';
    } else if (type === 'SOLANA') {
        addressTypeBadge.innerHTML = '<span class="address-type-badge badge-solana">Solana</span>';
    } else {
        addressTypeBadge.innerHTML = '';
    }
}

window.showCopyModal = function(type) {
    const destinationChainName = CHAIN_NAMES[chainSelect.value] || 'your selected chain';
    const receivingToken = currentToken === 'OTHERS' ? 'your chosen token' : currentToken;
    
    let title = '';
    let content = '';

    if (type === 'evm') {
        title = 'EVM Deposit Address';
        content = `
            <p>This is your unified deposit address for all supported <strong>EVM-compatible chains</strong>. (<a href="#" id="showChainsLink">View Supported Chains</a>)</p>
            <p>You can send any supported token from any of these chains to this address. Enclave will automatically convert the funds and send <strong>${receivingToken}</strong> to your wallet on the <strong>${destinationChainName}</strong> network.</p>
        `;
    } else {
        title = 'Solana Deposit Address';
        content = `
            <p>This is your unified deposit address for the <strong>Solana network</strong>.</p>
            <p>You can send any supported token from the Solana network to this address. Enclave will automatically convert the funds and send <strong>${receivingToken}</strong> to your wallet on the <strong>${destinationChainName}</strong> network.</p>
        `;
    }

    copyModalTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${title}`;
    copyModalContent.innerHTML = content;
    copyInstructionModal.classList.add('active');
    
    if (type === 'evm') {
        document.getElementById('showChainsLink').addEventListener('click', (e) => {
            e.preventDefault();
            chainsModal.classList.add('active');
        });
    }
    
    finalCopyBtn.onclick = () => {
        const addressId = type === 'evm' ? 'evmAddress' : 'solanaAddress';
        const qrWrapperId = type === 'evm' ? 'evmQrWrapper' : 'solanaQrWrapper';
        document.getElementById(qrWrapperId).classList.add('revealed');
        const addressElement = document.getElementById(addressId);
        navigator.clipboard.writeText(addressElement.textContent).then(() => {
            const originalHTML = finalCopyBtn.innerHTML;
            finalCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { 
                finalCopyBtn.innerHTML = originalHTML;
                copyInstructionModal.classList.remove('active');
            }, 1500);
        });
    };
};

function updateSelectedChainDisplay() {
    selectedChainText.textContent = CHAIN_NAMES[chainSelect.value] || 'your selected chain';
}

function updateFormBasedOnAddress(type) {
    const solanaChainId = '792703809';
    const defaultEvmChainId = '8453';
    const solTokenBtn = document.querySelector('[data-token="SOL"]');
    const usdcTokenBtn = document.querySelector('[data-token="USDC"]');
    
    for (const option of chainSelect.options) {
        const isSolanaOption = option.value === solanaChainId;
        if (type === 'SOLANA') {
            option.hidden = !isSolanaOption;
        } else if (type === 'EVM') {
            option.hidden = isSolanaOption;
        } else {
            option.hidden = false;
        }
    }

    if (type === 'SOLANA') {
        chainSelect.value = solanaChainId;
        solTokenBtn.style.display = 'block';
        if (usdcTokenBtn) usdcTokenBtn.click();
    } else if (type === 'EVM') {
        if (chainSelect.value === solanaChainId) {
            chainSelect.value = defaultEvmChainId;
        }
        solTokenBtn.style.display = 'none';
        if (solTokenBtn.classList.contains('active')) {
            if (usdcTokenBtn) usdcTokenBtn.click();
        }
    } else {
        solTokenBtn.style.display = 'block';
    }

    updateTokenAddress();
    updateSelectedChainDisplay();
}

walletInput.addEventListener('input', (e) => {
    const address = e.target.value.trim();
    detectedAddressType = detectAddressType(address);
    updateAddressTypeBadge(detectedAddressType);
    updateFormBasedOnAddress(detectedAddressType);
});

tokenButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tokenButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentToken = btn.dataset.token;
        updateTokenAddress();
        updateQuickRefButton();
    });
});

function updateQuickRefButton() {
    openRefBtn.disabled = (currentToken === 'OTHERS');
}

function populateTokenTable() {
    const tokenAddresses = TOKEN_DATA[currentToken];
    const hasData = tokenAddresses && Object.keys(tokenAddresses).length > 0;
    
    tableContainer.classList.toggle('hidden', !hasData);
    emptyState.classList.toggle('hidden', hasData);
    
    if (hasData) {
        tokenTableBody.innerHTML = '';
        Object.values(tokenAddresses).forEach(data => {
            const row = document.createElement('tr');
            row.className = 'token-row';
            row.innerHTML = `
                <td><div class="chain-name"><div class="chain-icon" style="background: ${data.color}"></div>${data.name}</div></td>
                <td class="address-cell" title="${data.address}">${data.address}</td>
                <td class="copy-cell"><button class="copy-icon-btn" onclick="copyTokenAddress('${data.address}', this)"><i class="fas fa-copy"></i> Copy</button></td>
            `;
            tokenTableBody.appendChild(row);
        });
    }
}

window.copyTokenAddress = function(address, button) {
    navigator.clipboard.writeText(address).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
        tokenInput.value = address;
    });
};

function updateTokenAddress() {
    const chainId = chainSelect.value;
    const tokenAddresses = TOKEN_DATA[currentToken];
    if (currentToken === 'OTHERS') {
        tokenInput.value = '';
        tokenInput.placeholder = 'Enter custom token contract address';
        return;
    }
    tokenInput.placeholder = 'Token contract address';
    tokenInput.value = tokenAddresses?.[chainId]?.address || '';
}

// --- Event Listeners ---
chainSelect.addEventListener('change', () => {
    updateTokenAddress();
    updateSelectedChainDisplay();
});

openRefBtn.addEventListener('click', () => {
    if (openRefBtn.disabled) return;
    modalTitle.innerHTML = `<i class="fas fa-book"></i> ${currentToken} Token Addresses`;
    populateTokenTable();
    tokenRefModal.classList.add('active');
});

closeTokenRefModal.addEventListener('click', () => tokenRefModal.classList.remove('active'));
tokenRefModal.addEventListener('click', (e) => {
    if (e.target === tokenRefModal) tokenRefModal.classList.remove('active');
});

closeCopyModal.addEventListener('click', () => copyInstructionModal.classList.remove('active'));
copyInstructionModal.addEventListener('click', (e) => {
    if (e.target === copyInstructionModal) copyInstructionModal.classList.remove('active');
});
acknowledgeCopyBtn.addEventListener('click', () => copyInstructionModal.classList.remove('active'));

closeChainsModal.addEventListener('click', () => chainsModal.classList.remove('active'));
chainsModal.addEventListener('click', (e) => {
    if (e.target === chainsModal) chainsModal.classList.remove('active');
});

advancedToggleBtn.addEventListener('click', () => {
    advancedSettings.classList.toggle('open');
    advancedToggleBtn.classList.toggle('open');
});

// The main action button
generateBtn.addEventListener('click', () => {
    handleGenerateClick(false);
});

// --- Initial State Setup ---
document.addEventListener('DOMContentLoaded', () => {
    walletInput.dispatchEvent(new Event('input', { bubbles: true }));
    updateTokenAddress();
    updateQuickRefButton();
    updateSelectedChainDisplay();
});
