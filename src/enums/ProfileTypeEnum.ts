enum ProfileTypeEnum {
  CUSTOMER = 'customer',
  LEGAL_CUSTOMER = 'legal_customer',
  CUSTOMER_EMPLOYEE = 'customer_employee',
  SELLER = 'seller',
  LEGAL_SELLER = 'legal_seller',
  SELLER_EMPLOYEE = 'seller_employee',
  SELLER_DRIVER = 'seller_driver',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
}

enum CustomerProfileTypeEnum {
  CUSTOMER_EMPLOYEE = 'customer_employee',
}

enum SellerProfileTypeEnum {
  SELLER_EMPLOYEE = 'seller_employee',
  SELLER_DRIVER = 'seller_driver',
}

export { ProfileTypeEnum, CustomerProfileTypeEnum, SellerProfileTypeEnum };
