import { PaymentMethod, DonationCategory } from '../types';

// Paymob integration configuration
const PAYMOB_CONFIG = {
  apiKey: 'YOUR_PAYMOB_API_KEY',
  integrationId: 'YOUR_INTEGRATION_ID',
  iframeId: 'YOUR_IFRAME_ID',
  baseUrl: 'https://accept.paymob.com/api',
};

// Charity bank account details for QR/InstaPay
const CHARITY_BANK_INFO = {
  bankName: 'البنك الأهلي المصري',
  accountName: 'جمعية الخير الخيرية',
  accountNumber: '1234567890123',
  iban: 'EG380019000500000001234567890',
  swiftCode: 'NBEGEGCX',
  instaPayHandle: 'charity-app@instapay',
};

export interface PaymentRequest {
  amount: number;
  category: DonationCategory;
  method: PaymentMethod;
  phone?: string;
  donorName?: string;
  donorEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionRef?: string;
  redirectUrl?: string;
  qrData?: string;
  message: string;
}

export const paymentService = {
  /**
   * Initiate Vodafone Cash payment via Paymob
   * Sends a USSD push to the donor's phone
   */
  async initiateVodafoneCash(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Step 1: Authenticate with Paymob
      const authResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: PAYMOB_CONFIG.apiKey }),
      });
      const authData = await authResponse.json();
      const token = authData.token;

      // Step 2: Create order
      const orderResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: token,
          delivery_needed: false,
          amount_cents: request.amount * 100,
          currency: 'EGP',
          items: [
            {
              name: `Donation - ${request.category}`,
              amount_cents: request.amount * 100,
              quantity: 1,
            },
          ],
        }),
      });
      const orderData = await orderResponse.json();

      // Step 3: Generate payment key for mobile wallet
      const paymentKeyResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: token,
          amount_cents: request.amount * 100,
          expiration: 3600,
          order_id: orderData.id,
          billing_data: {
            first_name: request.donorName || 'Donor',
            last_name: 'NA',
            email: request.donorEmail || 'donor@charity.org',
            phone_number: request.phone,
            street: 'NA',
            city: 'Cairo',
            country: 'EG',
            state: 'NA',
            building: 'NA',
            floor: 'NA',
            apartment: 'NA',
            shipping_method: 'NA',
            postal_code: 'NA',
          },
          currency: 'EGP',
          integration_id: PAYMOB_CONFIG.integrationId,
        }),
      });
      const paymentKeyData = await paymentKeyResponse.json();

      // Step 4: Process mobile wallet payment (USSD push)
      const walletResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/acceptance/payments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: {
            identifier: request.phone,
            subtype: 'WALLET',
          },
          payment_token: paymentKeyData.token,
        }),
      });
      const walletData = await walletResponse.json();

      return {
        success: true,
        transactionRef: walletData.id?.toString(),
        redirectUrl: walletData.redirect_url,
        message: 'تم إرسال طلب الدفع. يرجى تأكيد الدفع من تطبيق فودافون كاش.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'فشل في معالجة الدفع. يرجى المحاولة مرة أخرى.',
      };
    }
  },

  /**
   * Generate QR code data for InstaPay transfer
   * Contains the charity's bank account info
   */
  generateInstaPayQR(amount: number, category: DonationCategory): PaymentResponse {
    const qrData = JSON.stringify({
      type: 'instapay',
      recipient: CHARITY_BANK_INFO.instaPayHandle,
      accountName: CHARITY_BANK_INFO.accountName,
      amount,
      currency: 'EGP',
      reference: `DON-${Date.now()}-${category}`,
      bankName: CHARITY_BANK_INFO.bankName,
      iban: CHARITY_BANK_INFO.iban,
    });

    return {
      success: true,
      qrData,
      transactionRef: `QR-${Date.now()}`,
      message: 'امسح رمز QR من تطبيق البنك أو إنستاباي لإتمام التحويل',
    };
  },

  /**
   * Generate bank transfer details
   */
  getBankTransferDetails(): typeof CHARITY_BANK_INFO {
    return CHARITY_BANK_INFO;
  },

  /**
   * Verify payment status (polling)
   */
  async checkPaymentStatus(transactionRef: string): Promise<{ status: string; confirmed: boolean }> {
    try {
      const authResponse = await fetch(`${PAYMOB_CONFIG.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: PAYMOB_CONFIG.apiKey }),
      });
      const authData = await authResponse.json();

      const txResponse = await fetch(
        `${PAYMOB_CONFIG.baseUrl}/acceptance/transactions/${transactionRef}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );
      const txData = await txResponse.json();

      return {
        status: txData.success ? 'completed' : txData.pending ? 'pending' : 'failed',
        confirmed: txData.success === true,
      };
    } catch {
      return { status: 'unknown', confirmed: false };
    }
  },
};
