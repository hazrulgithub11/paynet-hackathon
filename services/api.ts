// const BASE_URL = 'http://192.168.1.7:3000';
const BASE_URL = "https://paynet.hrzhkm.xyz";
export interface User {
  userId: string;
  name: string;
  balance: number;
  accountNumber: string;
  phone: string;
  email: string;
}

export interface Merchant {
  merchantId: string;
  name: string;
  balance: number;
  accountNumber: string;
  qrCode: string;
  exchangeRate?: any;
}

export interface BankData {
  bankName: string;
  country: string;
  currency: string;
  users: User[];
  merchants: Merchant[];
}

export interface QRData {
  merchantId: string;
  merchantName: string;
  qrCode: string;
  country: string;
  currency: string;
}

export interface PaymentSession {
  sessionId: string;
  merchantName: string;
  status: string;
  direction: string;
  transactionHash?: string;
  blockNumber?: number;
}

export interface PaymentStatus {
  sessionId: string;
  merchantId: string;
  payerUserId: string;
  amount?: number;
  status: string;
  direction: string;
  timestamp: number;
  originBankVerified: boolean | null;
  destinationBankVerified: boolean | null;
  completedAt?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  // Generate QR code for merchant
  async generateQR(merchantId: string): Promise<{ qrData: QRData }> {
    return this.request(`/generate-qr/${merchantId}`);
  }

  // Scan QR code and initiate payment
  async scanQR(
    qrCode: string,
    payerUserId: string,
    payerCountry: string
  ): Promise<PaymentSession> {
    return this.request("/scan-qr", {
      method: "POST",
      body: JSON.stringify({ qrCode, payerUserId, payerCountry }),
    });
  }

  // Verify bank data
  async verifyBank(
    sessionId: string,
    bankId: string
  ): Promise<{
    sessionId: string;
    verified: boolean;
    status: string;
    transactionHash: string;
    blockNumber: number | null;
  }> {
    return this.request("/verify-bank", {
      method: "POST",
      body: JSON.stringify({ sessionId, bankId }),
    });
  }

  // Process payment
  async processPayment(
    sessionId: string,
    amount: number
  ): Promise<{
    sessionId: string;
    amount: number;
    status: string;
    direction: string;
    transactionHash: string;
    blockNumber: number;
  }> {
    return this.request("/process-payment", {
      method: "POST",
      body: JSON.stringify({ sessionId, amount }),
    });
  }

  // Get payment status
  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    return this.request(`/payment-status/${sessionId}`);
  }

  // Get bank private key (for testing purposes)
  async getBankPrivateKey(bankId: string): Promise<{ privateKey: string }> {
    return this.request(`/get-bank-private-key/${bankId}`);
  }

  // Get contract information
  async getContractInfo(): Promise<{
    contractAddress: string;
    network: string;
    isConnected: boolean;
  }> {
    return this.request("/contract-info");
  }

  // Debug endpoint - Get session details
  async getSessionDetails(sessionId: string): Promise<any> {
    return this.request(`/debug-session/${sessionId}`);
  }
}

export default new ApiService();
