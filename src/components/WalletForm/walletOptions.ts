export const WALLET_OPTIONS = ['Paytm', 'PhonePe', 'Amazon Pay'] as const
export type WalletName = (typeof WALLET_OPTIONS)[number]
