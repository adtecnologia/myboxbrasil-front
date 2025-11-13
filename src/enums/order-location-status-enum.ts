const OrderLocationStatusEnum = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED',
  REFUNDED: 'REFUNDED',
} as const;

type OrderLocationStatusEnum = (typeof OrderLocationStatusEnum)[keyof typeof OrderLocationStatusEnum];

export { OrderLocationStatusEnum };
