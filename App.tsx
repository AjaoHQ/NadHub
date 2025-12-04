import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ProductsProvider } from './src/store/products';
import { OrdersProvider } from './src/store/orders';
import { AuthProvider } from './src/store/auth';
import { CartProvider } from './src/store/cart_store';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ProductsProvider>
      <OrdersProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </OrdersProvider>
    </ProductsProvider>
  );
}
