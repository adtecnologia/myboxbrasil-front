const InvoicePaymentStatusEnum = {
  CREATED: "CREATED",
  CONFIRMED: "CONFIRMED",
  CANCELED: "CANCELED",
  REFUNDED: "REFUNDED",
  OVERDUE: "OVERDUE",
  RECEIVED: "RECEIVED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;

type InvoicePaymentStatusEnum =
  (typeof InvoicePaymentStatusEnum)[keyof typeof InvoicePaymentStatusEnum];

export { InvoicePaymentStatusEnum };
