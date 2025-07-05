// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrossBorderPayment {
    // Payment status enum
    enum PaymentStatus {
        PENDING,
        VERIFIED,
        COMPLETED,
        FAILED
    }

    // Payment direction enum
    enum PaymentDirection {
        THAILAND_TO_MALAYSIA,
        MALAYSIA_TO_THAILAND
    }

    // Payment struct
    struct Payment {
        string sessionId;
        string merchantId;
        string payerUserId;
        string payeeUserId;
        uint256 amount;
        PaymentStatus status;
        PaymentDirection direction;
        uint256 timestamp;
        bool originBankVerified;
        bool destinationBankVerified;
        string originBankId;
        string destinationBankId;
    }

    // Mapping to store payments
    mapping(string => Payment) public payments;

    // Simplified events for Thailand to Malaysia payments
    event VerifyThailandData(
        string indexed sessionId,
        string merchantId,
        bytes encryptedData,
        uint256 timestamp
    );

    event ThailandVerified(
        string indexed sessionId,
        bool verified,
        string bankId,
        uint256 timestamp
    );

    event ThailandPay(
        string indexed sessionId,
        string thaiUserId,
        uint256 amount,
        uint256 timestamp
    );

    // Simplified events for Malaysia to Thailand payments
    event VerifyMalaysiaData(
        string indexed sessionId,
        string merchantId,
        bytes encryptedData,
        uint256 timestamp
    );

    event MalaysiaVerified(
        string indexed sessionId,
        bool verified,
        string bankId,
        uint256 timestamp
    );

    event MalaysiaPay(
        string indexed sessionId,
        string malayUserId,
        uint256 amount,
        uint256 timestamp
    );

    // Common events
    event OriginBankPaymentProcessed(
        string indexed sessionId,
        bool success,
        uint256 timestamp
    );

    event DestinationBankPaymentProcessed(
        string indexed sessionId,
        bool success,
        uint256 timestamp
    );

    event PaymentCompleted(
        string indexed sessionId,
        uint256 amount,
        PaymentDirection direction,
        uint256 timestamp
    );

    // Initialize payment verification for Thailand to Malaysia
    function initiateThailandToMalaysiaPayment(
        string memory sessionId,
        string memory merchantId,
        bytes memory encryptedData
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length == 0,
            "Session already exists"
        );

        payments[sessionId] = Payment({
            sessionId: sessionId,
            merchantId: merchantId,
            payerUserId: "",
            payeeUserId: "",
            amount: 0,
            status: PaymentStatus.PENDING,
            direction: PaymentDirection.THAILAND_TO_MALAYSIA,
            timestamp: block.timestamp,
            originBankVerified: false,
            destinationBankVerified: false,
            originBankId: "THAI_BANK_001",
            destinationBankId: "MAYBANK_001"
        });

        emit VerifyThailandData(
            sessionId,
            merchantId,
            encryptedData,
            block.timestamp
        );
    }

    // Initialize payment verification for Malaysia to Thailand
    function initiateMalaysiaToThailandPayment(
        string memory sessionId,
        string memory merchantId,
        bytes memory encryptedData
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length == 0,
            "Session already exists"
        );

        payments[sessionId] = Payment({
            sessionId: sessionId,
            merchantId: merchantId,
            payerUserId: "",
            payeeUserId: "",
            amount: 0,
            status: PaymentStatus.PENDING,
            direction: PaymentDirection.MALAYSIA_TO_THAILAND,
            timestamp: block.timestamp,
            originBankVerified: false,
            destinationBankVerified: false,
            originBankId: "MAYBANK_001",
            destinationBankId: "THAI_BANK_001"
        });

        emit VerifyMalaysiaData(
            sessionId,
            merchantId,
            encryptedData,
            block.timestamp
        );
    }

    // Thailand bank verification response
    function confirmThailandVerification(
        string memory sessionId,
        bool verified,
        string memory bankId
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );

        // Update verification status based on bank role
        if (
            payments[sessionId].direction ==
            PaymentDirection.THAILAND_TO_MALAYSIA &&
            keccak256(bytes(bankId)) == keccak256(bytes("THAI_BANK_001"))
        ) {
            payments[sessionId].originBankVerified = verified;
        } else if (
            payments[sessionId].direction ==
            PaymentDirection.MALAYSIA_TO_THAILAND &&
            keccak256(bytes(bankId)) == keccak256(bytes("THAI_BANK_001"))
        ) {
            payments[sessionId].destinationBankVerified = verified;
        }

        // Update payment status
        if (verified && payments[sessionId].status == PaymentStatus.PENDING) {
            payments[sessionId].status = PaymentStatus.VERIFIED;
        } else if (!verified) {
            payments[sessionId].status = PaymentStatus.FAILED;
        }

        emit ThailandVerified(sessionId, verified, bankId, block.timestamp);
    }

    // Malaysia bank verification response
    function confirmMalaysiaVerification(
        string memory sessionId,
        bool verified,
        string memory bankId
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );

        // Update verification status based on bank role
        if (
            payments[sessionId].direction ==
            PaymentDirection.MALAYSIA_TO_THAILAND &&
            keccak256(bytes(bankId)) == keccak256(bytes("MAYBANK_001"))
        ) {
            payments[sessionId].originBankVerified = verified;
        } else if (
            payments[sessionId].direction ==
            PaymentDirection.THAILAND_TO_MALAYSIA &&
            keccak256(bytes(bankId)) == keccak256(bytes("MAYBANK_001"))
        ) {
            payments[sessionId].destinationBankVerified = verified;
        }

        // Update payment status
        if (verified && payments[sessionId].status == PaymentStatus.PENDING) {
            payments[sessionId].status = PaymentStatus.VERIFIED;
        } else if (!verified) {
            payments[sessionId].status = PaymentStatus.FAILED;
        }

        emit MalaysiaVerified(sessionId, verified, bankId, block.timestamp);
    }

    // Process Thailand payment
    function processThailandPayment(
        string memory sessionId,
        string memory thaiUserId,
        uint256 amount
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );
        require(
            payments[sessionId].status == PaymentStatus.VERIFIED,
            "Payment not verified"
        );

        payments[sessionId].payerUserId = thaiUserId;
        payments[sessionId].amount = amount;

        emit ThailandPay(sessionId, thaiUserId, amount, block.timestamp);
    }

    // Process Malaysia payment
    function processMalaysiaPayment(
        string memory sessionId,
        string memory malayUserId,
        uint256 amount
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );
        require(
            payments[sessionId].status == PaymentStatus.VERIFIED,
            "Payment not verified"
        );

        payments[sessionId].payerUserId = malayUserId;
        payments[sessionId].amount = amount;

        emit MalaysiaPay(sessionId, malayUserId, amount, block.timestamp);
    }

    // Confirm origin bank payment processed
    function confirmOriginBankPayment(
        string memory sessionId,
        bool success
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );

        emit OriginBankPaymentProcessed(sessionId, success, block.timestamp);

        if (success) {
            payments[sessionId].status = PaymentStatus.COMPLETED;
        } else {
            payments[sessionId].status = PaymentStatus.FAILED;
        }
    }

    // Confirm destination bank payment processed
    function confirmDestinationBankPayment(
        string memory sessionId,
        string memory payeeUserId,
        bool success
    ) public {
        require(
            bytes(payments[sessionId].sessionId).length > 0,
            "Session not found"
        );

        if (success) {
            payments[sessionId].payeeUserId = payeeUserId;
            payments[sessionId].destinationBankVerified = true;

            emit PaymentCompleted(
                sessionId,
                payments[sessionId].amount,
                payments[sessionId].direction,
                block.timestamp
            );
        }

        emit DestinationBankPaymentProcessed(
            sessionId,
            success,
            block.timestamp
        );
    }

    // Get payment details
    function getPayment(
        string memory sessionId
    ) public view returns (Payment memory) {
        return payments[sessionId];
    }

    // Get payment direction as string for easier frontend handling
    function getPaymentDirection(
        string memory sessionId
    ) public view returns (string memory) {
        if (
            payments[sessionId].direction ==
            PaymentDirection.THAILAND_TO_MALAYSIA
        ) {
            return "THAILAND_TO_MALAYSIA";
        } else {
            return "MALAYSIA_TO_THAILAND";
        }
    }

    // Check if both banks have verified the payment
    function isFullyVerified(
        string memory sessionId
    ) public view returns (bool) {
        return
            payments[sessionId].originBankVerified &&
            payments[sessionId].destinationBankVerified;
    }

    // Get verification status for debugging
    function getVerificationStatus(
        string memory sessionId
    )
        public
        view
        returns (
            bool originVerified,
            bool destinationVerified,
            string memory status
        )
    {
        Payment memory payment = payments[sessionId];

        string memory statusString;
        if (payment.status == PaymentStatus.PENDING) {
            statusString = "PENDING";
        } else if (payment.status == PaymentStatus.VERIFIED) {
            statusString = "VERIFIED";
        } else if (payment.status == PaymentStatus.COMPLETED) {
            statusString = "COMPLETED";
        } else {
            statusString = "FAILED";
        }

        return (
            payment.originBankVerified,
            payment.destinationBankVerified,
            statusString
        );
    }
}
