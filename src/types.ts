export type RootStackParamList = {
    RoleSelector: undefined;
    BuyerTabs: undefined;
    MerchantNavigator: undefined;
    BuyerNavigator: undefined;
    RiderNavigator: undefined;
};

export type BuyerStackParamList = {
    BuyerTabs: undefined;
    BuyerHome: undefined;
    ProductDetail: { productId: string };
    BuyerOrders: undefined;
    BuyerOrderDetail: { orderId: string };
    BuyerCart: undefined;
    Market: undefined;
    BuyerProfile: undefined;
    BuyerEditProfile: undefined;
    OrderTracking: { orderId: string };
    AddressList: undefined;
    EditAddress: { address?: any } | undefined;
    Review: { orderId: string };
};

export type MerchantStackParamList = {
    MerchantTabs: undefined;
    MerchantSignup: undefined;
};

export type MerchantTabParamList = {
    ProductsStack: undefined;
    AddProduct: undefined;
    OrdersStack: undefined; // Changed from MerchantOrders
    MerchantEarnings: undefined;
    MerchantProfile: undefined;
};

export type MerchantProductStackParamList = {
    ProductList: undefined;
    EditProduct: { productId: string };
};

export type MerchantOrderStackParamList = {
    MerchantOrders: undefined;
    MerchantOrderDetail: { orderId: string };
};

export type RiderStackParamList = {
    RiderTabs: undefined;
    RiderHome: undefined; // Added RiderHome to stack param list explicitly if needed, though usually part of Tabs
    RiderOrderDetail: { orderId: string };
    RiderHistory: undefined;
    RiderProfile: undefined;
    RiderReviews: undefined;
    RiderEditProfile: undefined;
    RiderSignup: undefined;
};
