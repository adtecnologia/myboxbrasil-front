const OrderLocationProductStatusEnum = {
  PENDING_DELIVERY: 'PENDING_DELIVERY',
  RENTED: 'RENTED',
  AWAITING_PICKUP: 'AWAITING_PICKUP',
  AWAITING_ANALISYS: 'AWAITING_ANALISYS',
  IN_TRANSIT_TO_RENTAL: 'IN_TRANSIT_TO_RENTAL',
  IN_TRANSIT_TO_PICKUP: 'IN_TRANSIT_TO_PICKUP',
  IN_TRANSIT_TO_FINAL_DESTINATION: 'IN_TRANSIT_TO_FINAL_DESTINATION',
  INVOICE_ISSUED: 'INVOICE_ISSUED',
} as const;

type OrderLocationProductStatusEnum =
  (typeof OrderLocationProductStatusEnum)[keyof typeof OrderLocationProductStatusEnum];

export { OrderLocationProductStatusEnum };
