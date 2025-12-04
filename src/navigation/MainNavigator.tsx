import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectorScreen from '../screens/RoleSelectorScreen';
import BuyerNavigator from './BuyerNavigator';
import MerchantNavigator from './MerchantNavigator';
import RiderNavigator from './RiderNavigator';
import AdminNavigator from './AdminNavigator';

export type MainStackParamList = {
    RoleSelector: undefined;
    BuyerMain: undefined;
    MerchantMain: undefined;
    RiderMain: undefined;
    AdminMain: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RoleSelector" component={RoleSelectorScreen} />
            <Stack.Screen name="BuyerMain" component={BuyerNavigator} />
            <Stack.Screen name="MerchantMain" component={MerchantNavigator} />
            <Stack.Screen name="RiderMain" component={RiderNavigator} />
            <Stack.Screen name="AdminMain" component={AdminNavigator} />
        </Stack.Navigator>
    );
}
