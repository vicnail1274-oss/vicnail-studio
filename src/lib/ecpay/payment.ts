/**
 * ECPay 綠界金流整合
 * 文件：https://developers.ecpay.com.tw/
 */
import crypto from "crypto";

const ECPAY_PAYMENT_URL =
  process.env.ECPAY_SANDBOX === "true"
    ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

interface PaymentParams {
  orderId: string;
  totalAmount: number;
  itemName: string;
  returnUrl: string;
  clientBackUrl: string;
  paymentMethods?: string[];
}

/**
 * 產生 ECPay CheckMacValue（SHA256）
 */
export function generateCheckMacValue(
  params: Record<string, string>
): string {
  const hashKey = process.env.ECPAY_HASH_KEY!;
  const hashIV = process.env.ECPAY_HASH_IV!;

  // 1. 按照 key 排序
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // 2. 前後加上 HashKey/HashIV
  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`;

  // 3. URL encode + 小寫
  const encoded = encodeURIComponent(raw)
    .toLowerCase()
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%20/g, "+");

  // 4. SHA256 + 大寫
  return crypto
    .createHash("sha256")
    .update(encoded)
    .digest("hex")
    .toUpperCase();
}

/**
 * 建立 ECPay 付款表單參數
 */
export function createPaymentForm({
  orderId,
  totalAmount,
  itemName,
  returnUrl,
  clientBackUrl,
  paymentMethods,
}: PaymentParams): { url: string; params: Record<string, string> } {
  const merchantId = process.env.ECPAY_MERCHANT_ID!;

  const now = new Date();
  const tradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  // 預設所有付款方式
  const choosePayment = paymentMethods?.length
    ? paymentMethods.join("#")
    : "ALL";

  const params: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: orderId.replace(/-/g, "").slice(0, 20),
    MerchantTradeDate: tradeDate,
    PaymentType: "aio",
    TotalAmount: String(totalAmount),
    TradeDesc: "VicNail Studio 商品訂單",
    ItemName: itemName,
    ReturnURL: returnUrl,
    ClientBackURL: clientBackUrl,
    ChoosePayment: choosePayment,
    EncryptType: "1",
    CustomField1: orderId, // 存完整 order UUID
  };

  params.CheckMacValue = generateCheckMacValue(params);

  return { url: ECPAY_PAYMENT_URL, params };
}

/**
 * 驗證 ECPay 回呼的 CheckMacValue
 */
export function verifyCallback(
  body: Record<string, string>
): boolean {
  const receivedMac = body.CheckMacValue;
  const paramsWithoutMac = { ...body };
  delete paramsWithoutMac.CheckMacValue;

  const expectedMac = generateCheckMacValue(paramsWithoutMac);
  return receivedMac === expectedMac;
}
