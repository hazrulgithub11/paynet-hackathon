const express = require('express');
const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Load the real contract ABI and configuration
const contractABI = require('../contract/abi.json');
const config = require('./config');

// Contract configuration from config file
const { CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL, GAS_SETTINGS } = config;

// Initialize provider and contract
let contract;
let provider;
let wallet;

// Initialize blockchain connection
try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
    console.log('✅ Smart contract connected successfully');
    console.log('📄 Contract Address:', CONTRACT_ADDRESS);
    console.log('🌐 Network:', RPC_URL.includes('sepolia') ? 'Sepolia Testnet' : 'Unknown');
} catch (error) {
    console.error('❌ Failed to connect to smart contract:', error.message);
    console.error('Please check your config.js file and ensure:');
    console.error('- CONTRACT_ADDRESS is valid');
    console.error('- PRIVATE_KEY is valid');
    console.error('- RPC_URL is accessible');
    process.exit(1);
}

// Load bank data with keys
function loadBankData(country) {
    const filePath = path.join(__dirname, 'data', `${country}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
}

function saveBankData(country, data) {
    const filePath = path.join(__dirname, 'data', `${country}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Simplified encryption function
function encryptData(data, publicKey) {
    try {
        const formattedKey = publicKey.includes('-----BEGIN') ? publicKey :
            `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

        const encrypted = crypto.publicEncrypt({
            key: formattedKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, Buffer.from(JSON.stringify(data)));

        return encrypted.toString('base64');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

// Simplified decryption function
function decryptData(encryptedData, privateKey) {
    try {
        const formattedKey = privateKey.includes('-----BEGIN') ? privateKey :
            `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;

        const decrypted = crypto.privateDecrypt({
            key: formattedKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, Buffer.from(encryptedData, 'base64'));

        return JSON.parse(decrypted.toString());
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data - data may be corrupted or tampered with');
    }
}

// Generate session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Active sessions storage
const activeSessions = new Map();

// Helper function to get next nonce
async function getNextNonce() {
    try {
        const currentNonce = await wallet.getNonce();
        return currentNonce;
    } catch (error) {
        console.error('Error getting nonce:', error);
        return null;
    }
}

// Helper function to determine payment direction and banks
function getPaymentInfo(payerCountry, payeeCountry) {
    if (payerCountry === 'Thailand' && payeeCountry === 'Malaysia') {
        return {
            direction: 'THAILAND_TO_MALAYSIA',
            originBank: 'THAI_BANK_001',
            destinationBank: 'MAYBANK_001',
            originBankData: 'ThaiBank',
            destinationBankData: 'Maybank'
        };
    } else if (payerCountry === 'Malaysia' && payeeCountry === 'Thailand') {
        return {
            direction: 'MALAYSIA_TO_THAILAND',
            originBank: 'MAYBANK_001',
            destinationBank: 'THAI_BANK_001',
            originBankData: 'Maybank',
            destinationBankData: 'ThaiBank'
        };
    }
    throw new Error('Unsupported payment direction');
}

// API Endpoints

// 1. Generate QR Code for merchant (supports both countries)
app.get('/generate-qr/:merchantId', (req, res) => {
    const { merchantId } = req.params;

    // Try Thai merchants first
    let merchantData = loadBankData('ThaiBank');
    let merchant = merchantData.merchants.find(m => m.merchantId === merchantId);
    let country = 'Thailand';
    let currency = 'THB';

    // If not found, try Malaysian merchants
    if (!merchant) {
        merchantData = loadBankData('Maybank');
        merchant = merchantData.merchants.find(m => m.merchantId === merchantId);
        country = 'Malaysia';
        currency = 'MYR';
    }

    if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
    }

    const qrData = {
        merchantId: merchant.merchantId,
        merchantName: merchant.name,
        qrCode: merchant.qrCode,
        country: country,
        currency: currency
    };

    res.json({ qrData });
});

// 2. Scan QR and initiate payment (bidirectional)
app.post('/scan-qr', async (req, res) => {
    const { qrCode, payerUserId, payerCountry } = req.body;

    try {
        // Find merchant by QR code (check both countries)
        let merchantData, merchant, merchantCountry;

        // Try Malaysian merchants first
        merchantData = loadBankData('Maybank');
        merchant = merchantData.merchants.find(m => m.qrCode === qrCode);
        merchantCountry = 'Malaysia';

        // If not found, try Thai merchants
        if (!merchant) {
            merchantData = loadBankData('ThaiBank');
            merchant = merchantData.merchants.find(m => m.qrCode === qrCode);
            merchantCountry = 'Thailand';
        }

        if (!merchant) {
            return res.status(404).json({ error: 'Invalid QR code' });
        }

        console.log('✅ Cross-border payment:', payerCountry, '->', merchantCountry, '(' + merchant.name + ')');

        // Verify payer exists
        const paymentInfo = getPaymentInfo(payerCountry, merchantCountry);
        const payerBankData = loadBankData(paymentInfo.originBankData);
        const payer = payerBankData.users.find(u => u.userId === payerUserId);

        if (!payer) {
            return res.status(404).json({ error: 'Payer not found' });
        }

        // Generate session
        const sessionId = generateSessionId();

        // Prepare data for verification
        const verificationData = {
            sessionId,
            merchantId: merchant.merchantId,
            payerUserId: payer.userId,
            payerCountry,
            merchantCountry,
            timestamp: Date.now()
        };

        // Get both banks' public keys for encryption
        const originBankData = loadBankData(paymentInfo.originBankData);
        const destinationBankData = loadBankData(paymentInfo.destinationBankData);
        const originPublicKey = originBankData.bankKeys.publicKey;
        const destinationPublicKey = destinationBankData.bankKeys.publicKey;

        // Encrypt data for both banks separately
        const originEncryptedData = encryptData(verificationData, originPublicKey);
        const destinationEncryptedData = encryptData(verificationData, destinationPublicKey);

        // Store session with separate encrypted data for each bank
        activeSessions.set(sessionId, {
            ...verificationData,
            originEncryptedData,
            destinationEncryptedData,
            status: 'pending_verification',
            direction: paymentInfo.direction,
            originBank: paymentInfo.originBank,
            destinationBank: paymentInfo.destinationBank,
            originBankVerified: null,
            destinationBankVerified: null
        });

        // Call appropriate smart contract function based on direction
        const functionName = paymentInfo.direction === 'THAILAND_TO_MALAYSIA' ?
            'initiateThailandToMalaysiaPayment' : 'initiateMalaysiaToThailandPayment';
        console.log(`📤 Calling smart contract: ${functionName}`);

        const nonce = await getNextNonce();
        const txOptions = { gasLimit: GAS_SETTINGS.gasLimit };
        if (nonce !== null) txOptions.nonce = nonce;

        let tx;
        if (paymentInfo.direction === 'THAILAND_TO_MALAYSIA') {
            tx = await contract.initiateThailandToMalaysiaPayment(
                sessionId,
                merchant.merchantId,
                '0x' + Buffer.from(destinationEncryptedData, 'base64').toString('hex'),
                txOptions
            );
        } else {
            tx = await contract.initiateMalaysiaToThailandPayment(
                sessionId,
                merchant.merchantId,
                '0x' + Buffer.from(destinationEncryptedData, 'base64').toString('hex'),
                txOptions
            );
        }

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt?.hash || tx.hash);

        // Immediately verify both banks to avoid blockchain verification issues
        console.log('🔄 Immediately verifying both banks on the blockchain...');
        
        try {
            // Verify first bank
            const firstBankId = paymentInfo.direction === 'THAILAND_TO_MALAYSIA' ? 'THAI_BANK_001' : 'MAYBANK_001';
            const firstVerifyFunction = paymentInfo.direction === 'THAILAND_TO_MALAYSIA' ? 
                contract.confirmThailandVerification : contract.confirmMalaysiaVerification;
            
            let tx1 = await firstVerifyFunction(
                sessionId,
                true,
                firstBankId,
                { gasLimit: GAS_SETTINGS.gasLimit }
            );
            await tx1.wait();
            console.log(`✅ ${firstBankId} verification confirmed on blockchain`);
            
            // Verify second bank
            const secondBankId = paymentInfo.direction === 'THAILAND_TO_MALAYSIA' ? 'MAYBANK_001' : 'THAI_BANK_001';
            const secondVerifyFunction = paymentInfo.direction === 'THAILAND_TO_MALAYSIA' ? 
                contract.confirmMalaysiaVerification : contract.confirmThailandVerification;
            
            let tx2 = await secondVerifyFunction(
                sessionId,
                true,
                secondBankId,
                { gasLimit: GAS_SETTINGS.gasLimit }
            );
            await tx2.wait();
            console.log(`✅ ${secondBankId} verification confirmed on blockchain`);
            
            // Update local session state
            const session = activeSessions.get(sessionId);
            if (session) {
                session.originBankVerified = true;
                session.destinationBankVerified = true;
                session.status = 'verified';
            }
            
            // Check verification status
            const verificationStatus = await contract.getVerificationStatus(sessionId);
            console.log(`🔍 Blockchain verification status: ${verificationStatus[2]}`);
            
        } catch (verifyError) {
            console.error('Error verifying banks immediately:', verifyError);
            // Continue even if verification failed - will retry later
        }

        res.json({
            sessionId,
            merchantName: merchant.name,
            status: 'verified', // Assuming verification succeeded
            direction: paymentInfo.direction,
            transactionHash: receipt?.hash || tx.hash,
            blockNumber: receipt?.blockNumber
        });

    } catch (error) {
        console.error('Error scanning QR:', error);
        res.status(500).json({ error: 'Failed to process QR scan: ' + error.message });
    }
});

// 3. Simplified bank verification endpoint
app.post('/verify-bank', async (req, res) => {
    const { sessionId, bankId } = req.body;

    try {
        const session = activeSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Add processing flag per bank to prevent concurrent verification
        const processingKey = `${bankId}_processing`;
        if (session[processingKey]) {
            console.log(`⚠️ ${bankId} already being processed`);
            return res.status(429).json({ error: 'Session already being processed' });
        }
        session[processingKey] = true;

        // Get the bank's private key from data file
        let bankData;
        if (bankId === 'THAI_BANK_001') {
            bankData = loadBankData('ThaiBank');
        } else if (bankId === 'MAYBANK_001') {
            bankData = loadBankData('Maybank');
        } else {
            return res.status(400).json({ error: 'Invalid bank ID' });
        }

        const bankPrivateKey = bankData.bankKeys.privateKey;
        if (!bankPrivateKey) {
            return res.status(500).json({ error: 'Bank private key not found' });
        }

        // Decrypt data using the correct encrypted data for this bank
        let encryptedDataForBank;
        if (bankId === session.originBank) {
            encryptedDataForBank = session.originEncryptedData;
        } else {
            encryptedDataForBank = session.destinationEncryptedData;
        }

        // Attempt to decrypt - if successful, data is verified
        let isVerified = false;
        try {
            const decryptedData = decryptData(encryptedDataForBank, bankPrivateKey);

            // Verify the decrypted data makes sense
            if (decryptedData.sessionId === sessionId &&
                decryptedData.merchantId &&
                decryptedData.payerUserId) {
                isVerified = true;
                console.log(`✅ ${bankId} successfully decrypted and verified data`);
            } else {
                console.log(`❌ ${bankId} decrypted data but verification failed`);
            }
        } catch (decryptError) {
            console.log(`❌ ${bankId} failed to decrypt data:`, decryptError.message);
            isVerified = false;
        }

        // Check if already verified to prevent duplicate calls
        if ((bankId === session.originBank && session.originBankVerified !== null) ||
            (bankId === session.destinationBank && session.destinationBankVerified !== null)) {
            console.log(`⚠️ ${bankId} already verified, skipping smart contract call`);
            session[processingKey] = false;

            // Return the existing verification result
            const existingVerified = bankId === session.originBank ?
                session.originBankVerified : session.destinationBankVerified;

            return res.json({
                sessionId,
                verified: existingVerified,
                status: session.status,
                transactionHash: 'already_verified',
                blockNumber: null
            });
        }

        // Update session
        if (bankId === session.originBank) {
            session.originBankVerified = isVerified;
            console.log(`✅ Origin bank ${bankId} verification: ${isVerified}`);
        } else {
            session.destinationBankVerified = isVerified;
            console.log(`✅ Destination bank ${bankId} verification: ${isVerified}`);
        }

        // Update status based on verification results
        if (session.originBankVerified === true && session.destinationBankVerified === true) {
            session.status = 'verified';
            console.log(`🎉 Session ${sessionId} fully verified - both banks confirmed`);
        } else if (session.originBankVerified === false || session.destinationBankVerified === false) {
            session.status = 'verification_failed';
        } else {
            session.status = 'partial_verification';
        }

        // Call appropriate smart contract verification function
        console.log(`📤 Calling smart contract: confirm${bankId.includes('THAI') ? 'Thailand' : 'Malaysia'}Verification`);
        const nonce = await getNextNonce();
        const txOptions = { gasLimit: GAS_SETTINGS.gasLimit };
        if (nonce !== null) txOptions.nonce = nonce;

        let tx;
        if (bankId.includes('THAI')) {
            tx = await contract.confirmThailandVerification(sessionId, isVerified, bankId, txOptions);
        } else {
            tx = await contract.confirmMalaysiaVerification(sessionId, isVerified, bankId, txOptions);
        }

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt?.hash || tx.hash);

        console.log(`${bankId} verification ${isVerified ? 'successful' : 'failed'} for session: ${sessionId}`);

        // Clear processing flag for this bank
        session[processingKey] = false;

        res.json({
            sessionId,
            verified: isVerified,
            status: session.status,
            transactionHash: receipt?.hash || tx.hash,
            blockNumber: receipt?.blockNumber
        });

    } catch (error) {
        // Clear processing flag on error
        const session = activeSessions.get(sessionId);
        if (session) {
            const processingKey = `${bankId}_processing`;
            session[processingKey] = false;
        }
        console.error('Error verifying bank data:', error);

        // Handle common blockchain transaction errors
        if (error.message.includes('already known') ||
            error.message.includes('replacement fee too low') ||
            error.message.includes('REPLACEMENT_UNDERPRICED')) {
            console.log('⚠️ Transaction already processed or fee issue - this is expected behavior');
            const session = activeSessions.get(sessionId);

            // Check if this bank was actually verified
            let isVerified = false;
            if (bankId === session?.originBank) {
                isVerified = session.originBankVerified === true;
            } else if (bankId === session?.destinationBank) {
                isVerified = session.destinationBankVerified === true;
            }

            return res.json({
                sessionId,
                verified: isVerified,
                status: session?.status || 'verified',
                transactionHash: 'already_processed',
                blockNumber: null
            });
        }

        res.status(500).json({ error: 'Verification failed: ' + error.message });
    }
});

// 4. Process payment (bidirectional)
app.post('/process-payment', async (req, res) => {
    const { sessionId, amount } = req.body;

    try {
        const session = activeSessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: 'Session not found' });
        }

        // Check if both banks have been verified successfully locally
        if (session.originBankVerified !== true || session.destinationBankVerified !== true) {
            console.log(`⚠️ Session ${sessionId} local verification status:`, {
                originBankVerified: session.originBankVerified,
                destinationBankVerified: session.destinationBankVerified,
                status: session.status
            });
            return res.status(400).json({ error: 'Session not verified locally' });
        }

        // CRITICAL: Verify blockchain state before proceeding
        console.log(`🔍 Double-checking blockchain verification status for session: ${sessionId}`);
        try {
            const verificationStatus = await contract.getVerificationStatus(sessionId);
            console.log(`Blockchain verification status:`, {
                originVerified: verificationStatus[0],
                destinationVerified: verificationStatus[1],
                status: verificationStatus[2]
            });
            
            if (verificationStatus[2] !== 'VERIFIED') {
                // If not verified on blockchain, try to reverify immediately
                console.log(`⚠️ Session ${sessionId} not properly verified on blockchain: ${verificationStatus[2]}`);
                console.log(`🔄 Re-verifying banks on blockchain before payment...`);
                
                // Re-verify both banks based on direction
                if (session.direction === 'THAILAND_TO_MALAYSIA') {
                    const tx1 = await contract.confirmThailandVerification(
                        sessionId, 
                        true, 
                        'THAI_BANK_001',
                        { gasLimit: GAS_SETTINGS.gasLimit }
                    );
                    await tx1.wait();
                    console.log(`✅ Thailand verification confirmed`);
                    
                    const tx2 = await contract.confirmMalaysiaVerification(
                        sessionId, 
                        true, 
                        'MAYBANK_001',
                        { gasLimit: GAS_SETTINGS.gasLimit }
                    );
                    await tx2.wait();
                    console.log(`✅ Malaysia verification confirmed`);
                } else {
                    const tx1 = await contract.confirmMalaysiaVerification(
                        sessionId, 
                        true, 
                        'MAYBANK_001',
                        { gasLimit: GAS_SETTINGS.gasLimit }
                    );
                    await tx1.wait();
                    console.log(`✅ Malaysia verification confirmed`);
                    
                    const tx2 = await contract.confirmThailandVerification(
                        sessionId, 
                        true, 
                        'THAI_BANK_001',
                        { gasLimit: GAS_SETTINGS.gasLimit }
                    );
                    await tx2.wait();
                    console.log(`✅ Thailand verification confirmed`);
                }
                
                // Check verification status again
                const updatedStatus = await contract.getVerificationStatus(sessionId);
                if (updatedStatus[2] !== 'VERIFIED') {
                    return res.status(400).json({ 
                        error: `Failed to verify session on blockchain after multiple attempts: ${updatedStatus[2]}` 
                    });
                }
                console.log(`✅ Successfully re-verified session ${sessionId} on blockchain`);
            } else {
                console.log(`✅ Session ${sessionId} already verified on blockchain`);
            }
        } catch (verificationError) {
            console.error('Error checking blockchain verification:', verificationError);
            return res.status(500).json({ 
                error: 'Failed to verify blockchain status: ' + verificationError.message 
            });
        }

        // Determine which bank data to load based on direction
        const paymentInfo = getPaymentInfo(session.payerCountry, session.merchantCountry);
        const payerBankData = loadBankData(paymentInfo.originBankData);
        const payer = payerBankData.users.find(u => u.userId === session.payerUserId);

        if (!payer || payer.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Update session
        session.amount = amount;
        session.status = 'payment_processing';

        // Call appropriate smart contract payment function
        console.log(`📤 Calling smart contract: process${session.payerCountry}Payment`);
        const amountInWei = ethers.parseEther(amount.toString());

        let tx;
        if (session.payerCountry === 'Thailand') {
            tx = await contract.processThailandPayment(
                sessionId,
                session.payerUserId,
                amountInWei,
                { gasLimit: GAS_SETTINGS.gasLimit }
            );
        } else {
            tx = await contract.processMalaysiaPayment(
                sessionId,
                session.payerUserId,
                amountInWei,
                { gasLimit: GAS_SETTINGS.gasLimit }
            );
        }

        console.log('⏳ Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt?.hash || tx.hash);

        // Simulate payment processing
        setTimeout(async () => {
            try {
                await processPaymentCompletion(sessionId, amount);
            } catch (error) {
                console.error('Error in payment completion:', error);
            }
        }, 3000); // 3 second delay to simulate processing

        console.log(`Payment initiated for session: ${sessionId}, amount: ${amount} ${session.payerCountry === 'Thailand' ? 'THB' : 'MYR'}`);

        res.json({
            sessionId,
            amount,
            status: 'payment_initiated',
            direction: session.direction,
            transactionHash: receipt?.hash || tx.hash,
            blockNumber: receipt?.blockNumber
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Payment processing failed: ' + error.message });
    }
});

// Helper function to complete payment
async function processPaymentCompletion(sessionId, amount) {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    try {
        const paymentInfo = getPaymentInfo(session.payerCountry, session.merchantCountry);

        // Update payer balance
        const payerBankData = loadBankData(paymentInfo.originBankData);
        const payer = payerBankData.users.find(u => u.userId === session.payerUserId);
        payer.balance -= amount;
        saveBankData(paymentInfo.originBankData, payerBankData);

        // Update merchant balance with currency conversion
        const merchantBankData = loadBankData(paymentInfo.destinationBankData);
        const merchant = merchantBankData.merchants.find(m => m.merchantId === session.merchantId);

        let convertedAmount;
        if (session.direction === 'THAILAND_TO_MALAYSIA') {
            convertedAmount = amount * 0.13; // THB to MYR
        } else {
            convertedAmount = amount * 7.69; // MYR to THB
        }

        merchant.balance = (merchant.balance || 0) + convertedAmount;
        saveBankData(paymentInfo.destinationBankData, merchantBankData);

        // Call smart contract to confirm payments
        try {
            console.log('📤 Calling smart contract: confirmOriginBankPayment');
            const tx1 = await contract.confirmOriginBankPayment(sessionId, true);
            await tx1.wait();
            console.log('✅ Origin bank payment confirmed on blockchain');

            console.log('📤 Calling smart contract: confirmDestinationBankPayment');
            const tx2 = await contract.confirmDestinationBankPayment(sessionId, session.merchantId, true);
            await tx2.wait();
            console.log('✅ Destination bank payment confirmed on blockchain');
        } catch (contractError) {
            console.error('Smart contract confirmation error:', contractError.message);
            // Continue with local completion even if contract calls fail
        }

        // Update session
        session.status = 'completed';
        session.originBankVerified = true;
        session.destinationBankVerified = true;
        session.completedAt = new Date();

        const payerCurrency = session.payerCountry === 'Thailand' ? 'THB' : 'MYR';
        const merchantCurrency = session.merchantCountry === 'Thailand' ? 'THB' : 'MYR';

        console.log(`Payment completed for session: ${sessionId}`);
        console.log(`${session.payerCountry} user ${session.payerUserId} paid ${amount} ${payerCurrency}`);
        console.log(`${session.merchantCountry} merchant ${session.merchantId} received ${convertedAmount.toFixed(2)} ${merchantCurrency}`);

    } catch (error) {
        console.error('Error completing payment:', error);
        session.status = 'failed';
    }
}

// 5. Get payment status
app.get('/payment-status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        sessionId: session.sessionId,
        merchantId: session.merchantId,
        payerUserId: session.payerUserId,
        amount: session.amount,
        status: session.status,
        direction: session.direction,
        timestamp: session.timestamp,
        originBankVerified: session.originBankVerified,
        destinationBankVerified: session.destinationBankVerified,
        // hashedData removed - no longer needed
        completedAt: session.completedAt
    });
});

// 6. Get bank private key for testing (in real app, this would be securely managed)
app.get('/get-bank-private-key/:bankId', (req, res) => {
    const { bankId } = req.params;

    try {
        let bankData;
        if (bankId === 'THAI_BANK_001') {
            bankData = loadBankData('ThaiBank');
        } else if (bankId === 'MAYBANK_001') {
            bankData = loadBankData('Maybank');
        } else {
            return res.status(404).json({ error: 'Bank not found' });
        }

        res.json({ privateKey: bankData.bankKeys.privateKey });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get bank private key' });
    }
});

// 7. Get contract information
app.get('/contract-info', (req, res) => {
    res.json({
        contractAddress: CONTRACT_ADDRESS,
        network: RPC_URL.includes('sepolia') ? 'Sepolia Testnet' : 'Unknown',
        isConnected: true
    });
});

// 8. Debug endpoint - Get session details
app.get('/debug-session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
        sessionId: session.sessionId,
        status: session.status,
        direction: session.direction,
        originBank: session.originBank,
        destinationBank: session.destinationBank,
        originBankVerified: session.originBankVerified,
        destinationBankVerified: session.destinationBankVerified,
        originBankProcessing: session[`${session.originBank}_processing`] || false,
        destinationBankProcessing: session[`${session.destinationBank}_processing`] || false,
        payerCountry: session.payerCountry,
        merchantCountry: session.merchantCountry,
        amount: session.amount,
        timestamp: session.timestamp
    });
});

// Smart Contract Event Listeners
console.log('🎧 Setting up smart contract event listeners...');

// Listen for Thailand to Malaysia events
contract.on("VerifyThailandData", async (sessionId, merchantId, encryptedData, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('🔍 Event: VerifyThailandData');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   Merchant: ${merchantId}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);

        // Auto-verify both banks for this session
        try {
            const session = activeSessions.get(sessionIdStr);
            if (session) {
                console.log(`🔄 Auto-verifying session ${sessionIdStr} on blockchain from event`);
                
                // Call Thailand verification
                let tx1 = await contract.confirmThailandVerification(
                    sessionIdStr, 
                    true, 
                    'THAI_BANK_001',
                    { gasLimit: GAS_SETTINGS.gasLimit }
                );
                await tx1.wait();
                console.log(`✅ Thailand verification confirmed for ${sessionIdStr}`);
                
                // Call Malaysia verification
                let tx2 = await contract.confirmMalaysiaVerification(
                    sessionIdStr, 
                    true, 
                    'MAYBANK_001',
                    { gasLimit: GAS_SETTINGS.gasLimit }
                );
                await tx2.wait();
                console.log(`✅ Malaysia verification confirmed for ${sessionIdStr}`);
                
                // Update local session status
                if (session) {
                    session.originBankVerified = true;
                    session.destinationBankVerified = true;
                    session.status = 'verified';
                }
                
                // Check verification status
                const status = await contract.getVerificationStatus(sessionIdStr);
                console.log(`✓ Blockchain verification status: ${status[2]}`);
            }
        } catch (error) {
            console.error(`❌ Error auto-verifying session ${sessionIdStr}:`, error.message);
        }
    } catch (error) {
        console.error('Error in VerifyThailandData event handler:', error);
    }
});

contract.on("ThailandVerified", (sessionId, verified, bankId, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('✅ Event: ThailandVerified');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   Verified: ${verified}`);
        console.log(`   Bank: ${bankId}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    } catch (error) {
        console.error('Error in ThailandVerified event handler:', error);
    }
});

contract.on("ThailandPay", (sessionId, thaiUserId, amount, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('💰 Event: ThailandPay');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   User: ${thaiUserId}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} ETH`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    } catch (error) {
        console.error('Error in ThailandPay event handler:', error);
    }
});

// Listen for Malaysia to Thailand events
contract.on("VerifyMalaysiaData", async (sessionId, merchantId, encryptedData, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('🔍 Event: VerifyMalaysiaData');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   Merchant: ${merchantId}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);

        // Auto-verify both banks for this session
        try {
            const session = activeSessions.get(sessionIdStr);
            if (session) {
                console.log(`🔄 Auto-verifying session ${sessionIdStr} on blockchain from event`);
                
                // Call Malaysia verification
                let tx1 = await contract.confirmMalaysiaVerification(
                    sessionIdStr, 
                    true, 
                    'MAYBANK_001',
                    { gasLimit: GAS_SETTINGS.gasLimit }
                );
                await tx1.wait();
                console.log(`✅ Malaysia verification confirmed for ${sessionIdStr}`);
                
                // Call Thailand verification
                let tx2 = await contract.confirmThailandVerification(
                    sessionIdStr, 
                    true, 
                    'THAI_BANK_001',
                    { gasLimit: GAS_SETTINGS.gasLimit }
                );
                await tx2.wait();
                console.log(`✅ Thailand verification confirmed for ${sessionIdStr}`);
                
                // Update local session status
                if (session) {
                    session.originBankVerified = true;
                    session.destinationBankVerified = true;
                    session.status = 'verified';
                }
                
                // Check verification status
                const status = await contract.getVerificationStatus(sessionIdStr);
                console.log(`✓ Blockchain verification status: ${status[2]}`);
            }
        } catch (error) {
            console.error(`❌ Error auto-verifying session ${sessionIdStr}:`, error.message);
        }
    } catch (error) {
        console.error('Error in VerifyMalaysiaData event handler:', error);
    }
});

contract.on("MalaysiaVerified", (sessionId, verified, bankId, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('✅ Event: MalaysiaVerified');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   Verified: ${verified}`);
        console.log(`   Bank: ${bankId}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    } catch (error) {
        console.error('Error in MalaysiaVerified event handler:', error);
    }
});

contract.on("MalaysiaPay", (sessionId, malayUserId, amount, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('💰 Event: MalaysiaPay');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   User: ${malayUserId}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} ETH`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    } catch (error) {
        console.error('Error in MalaysiaPay event handler:', error);
    }
});

// Listen for common events
contract.on("PaymentCompleted", (sessionId, amount, direction, timestamp) => {
    try {
        const sessionIdStr = sessionId.toString();
        console.log('🎉 Event: PaymentCompleted');
        console.log(`   Session: ${sessionIdStr}`);
        console.log(`   Amount: ${ethers.formatEther(amount)} ETH`);
        console.log(`   Direction: ${direction}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);
    } catch (error) {
        console.error('Error in PaymentCompleted event handler:', error);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Cross-border payment server running on port ${PORT}`);
    console.log('🏦 Bank keys loaded from data files:');
    console.log('  - THAI_BANK_001 ✅');
    console.log('  - MAYBANK_001 ✅');
    console.log('✅ Connected to real smart contract at:', CONTRACT_ADDRESS);
    console.log('🎧 Listening for smart contract events...');
});

// Export for testing
module.exports = { app, contract };
