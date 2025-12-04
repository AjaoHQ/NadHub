import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BuyerStackParamList } from '../types';
import HomeScreen from '../screens/HomeScreen';
import MarketScreen from '../screens/MarketScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import BuyerOrdersScreen from '../screens/buyer/BuyerOrdersScreen';
import BuyerOrderDetailScreen from '../screens/buyer/BuyerOrderDetailScreen';
import BuyerCartScreen from '../screens/buyer/BuyerCartScreen';
import BuyerProfileScreen from '../screens/buyer/BuyerProfileScreen';
import BuyerEditProfileScreen from '../screens/buyer/BuyerEditProfileScreen';
import OrderTrackingScreen from '../screens/buyer/OrderTrackingScreen';
import AddressListScreen from '../screens/buyer/AddressListScreen';
import EditAddressScreen from '../screens/buyer/EditAddressScreen';
import ReviewScreen from '../screens/buyer/ReviewScreen';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../store/cart_store';
import { NadHubLogoTitle } from '../components/NadHubLogoTitle';

const Stack = createNativeStackNavigator<BuyerStackParamList>();
const Tab = createBottomTabNavigator();

function BuyerTabs() {
    const navigation = useNavigation<any>();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerTitle: () => <NadHubLogoTitle />,
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: '#000A0A',
                },
                headerTintColor: '#36D873',
                tabBarStyle: {
                    backgroundColor: '#000A0A',
                    borderTopColor: '#102020',
                },
                tabBarActiveTintColor: '#36D873',
                tabBarInactiveTintColor: '#6A7A7A',
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
                    if (route.name === 'BuyerHome') iconName = 'home-outline';
                    else if (route.name === 'BuyerOrders') iconName = 'receipt-outline';
                    else if (route.name === 'BuyerProfile') iconName = 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                headerRight: () => {
                    const { cartItems } = useCart();
                    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                    return (
                        <TouchableOpacity onPress={() => navigation.navigate('BuyerCart')} style={styles.cartButton}>
                            <Ionicons name="cart-outline" size={24} color="#36D873" />
                            {itemCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{itemCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                },
            })}
        >
            <Tab.Screen
                name="BuyerHome"
                component={HomeScreen}
                options={{ title: 'หน้าแรก' }}
            />
            <Tab.Screen
                name="BuyerOrders"
                component={BuyerOrdersScreen}
                options={{ title: 'ออเดอร์' }}
            />
            <Tab.Screen
                name="BuyerProfile"
                component={BuyerProfileScreen}
                options={{ title: 'โปรไฟล์' }}
            />
        </Tab.Navigator>
    );
}

export default function BuyerNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="BuyerTabs"
                component={BuyerTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Market"
                component={MarketScreen}
                options={{
                    title: 'ตลาด NadHub',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'รายละเอียดสินค้า' }}
            />
            <Stack.Screen
                name="BuyerOrderDetail"
                component={BuyerOrderDetailScreen}
                options={{ title: 'รายละเอียดคำสั่งซื้อ' }}
            />
            <Stack.Screen
                name="BuyerCart"
                component={BuyerCartScreen}
                options={{ title: 'ตะกร้าสินค้า' }}
            />
            <Stack.Screen
                name="BuyerEditProfile"
                component={BuyerEditProfileScreen}
                options={{
                    title: 'แก้ไขโปรไฟล์',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
            <Stack.Screen
                name="OrderTracking"
                component={OrderTrackingScreen}
                options={{
                    title: 'ติดตามสถานะ',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
            <Stack.Screen
                name="AddressList"
                component={AddressListScreen}
                options={{
                    title: 'จัดการที่อยู่',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
            <Stack.Screen
                name="EditAddress"
                component={EditAddressScreen}
                options={{
                    title: 'แก้ไขที่อยู่',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
            <Stack.Screen
                name="Review"
                component={ReviewScreen}
                options={{
                    title: 'ให้คะแนนร้านค้า',
                    headerStyle: { backgroundColor: '#000A0A' },
                    headerTintColor: '#36D873',
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    cartButton: {
        marginRight: 16,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
