import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MerchantTabParamList, MerchantProductStackParamList, MerchantOrderStackParamList, MerchantStackParamList } from '../types';

import ProductListScreen from '../screens/merchant/ProductListScreen';
import AddProductScreen from '../screens/merchant/AddProductScreen';
import EditProductScreen from '../screens/merchant/EditProductScreen';
import MerchantOrdersScreen from '../screens/merchant/MerchantOrdersScreen';
import MerchantOrderDetailScreen from '../screens/merchant/MerchantOrderDetailScreen';
import MerchantEarningsScreen from '../screens/merchant/MerchantEarningsScreen';
import MerchantProfileScreen from '../screens/merchant/MerchantProfileScreen';

import MerchantSignupScreen from '../screens/merchant/MerchantSignupScreen';

const Tab = createBottomTabNavigator<MerchantTabParamList>();
const ProductStack = createNativeStackNavigator<MerchantProductStackParamList>();
const OrderStack = createNativeStackNavigator<MerchantOrderStackParamList>();
const MainStack = createNativeStackNavigator<MerchantStackParamList>();

function MerchantProductStack() {
    return (
        <ProductStack.Navigator>
            <ProductStack.Screen
                name="ProductList"
                component={ProductListScreen}
                options={{ title: 'สินค้า' }}
            />
            <ProductStack.Screen
                name="EditProduct"
                component={EditProductScreen}
                options={{ title: 'แก้ไขสินค้า' }}
            />
        </ProductStack.Navigator>
    );
}

function MerchantOrderStack() {
    return (
        <OrderStack.Navigator>
            <OrderStack.Screen
                name="MerchantOrders"
                component={MerchantOrdersScreen}
                options={{ title: 'ออเดอร์' }}
            />
            <OrderStack.Screen
                name="MerchantOrderDetail"
                component={MerchantOrderDetailScreen}
                options={{ title: 'รายละเอียดออเดอร์' }}
            />
        </OrderStack.Navigator>
    );
}

function MerchantTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'list';

                    if (route.name === 'ProductsStack') iconName = 'list';
                    if (route.name === 'AddProduct') iconName = 'add-circle';
                    if (route.name === 'OrdersStack') iconName = 'receipt';
                    if (route.name === 'MerchantEarnings') iconName = 'cash';
                    if (route.name === 'MerchantProfile') iconName = 'storefront';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#34C759',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="ProductsStack"
                component={MerchantProductStack}
                options={{ title: 'สินค้า', headerShown: false }}
            />
            <Tab.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={{ title: 'เพิ่มสินค้า' }}
            />
            <Tab.Screen
                name="OrdersStack"
                component={MerchantOrderStack}
                options={{ title: 'ออเดอร์', headerShown: false }}
            />
            <Tab.Screen
                name="MerchantEarnings"
                component={MerchantEarningsScreen}
                options={{ title: 'รายได้' }}
            />
            <Tab.Screen
                name="MerchantProfile"
                component={MerchantProfileScreen}
                options={{ title: 'ร้านค้า' }}
            />
        </Tab.Navigator>
    );
}

export default function MerchantNavigator() {
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false }}>
            <MainStack.Screen name="MerchantTabs" component={MerchantTabs} />
            <MainStack.Screen
                name="MerchantSignup"
                component={MerchantSignupScreen}
                options={{
                    headerShown: true,
                    title: 'ลงทะเบียนร้านค้า',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />
        </MainStack.Navigator>
    );
}
