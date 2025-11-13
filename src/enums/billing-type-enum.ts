const BillingTypeStatusEnum = {
  BOLETO: "BOLETO",
  CREDIT_CARD: "CREDIT_CARD",
  UNDEFINED: "UNDEFINED",
  DEBIT_CARD: "DEBIT_CARD",
  TRANSFER: "TRANSFER",
  DEPOSIT: "DEPOSIT",
  PIX: "PIX",
} as const;

type BillingTypeStatusEnum =
  (typeof BillingTypeStatusEnum)[keyof typeof BillingTypeStatusEnum];

export { BillingTypeStatusEnum };
