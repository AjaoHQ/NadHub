import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminMerchantReviewScreen from '../screens/admin/AdminMerchantReviewScreen';
import AdminRiderReviewScreen from '../screens/admin/AdminRiderReviewScreen';

export type AdminStackParamList = {
    AdminHome: undefined;
    AdminMerchantReview: undefined;
    AdminRiderReview: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdminMerchantReview"
                component={AdminMerchantReviewScreen}
                options={{ title: 'อนุมัติร้านค้า' }}
            />
            <Stack.Screen
                name="AdminRiderReview"
                component={AdminRiderReviewScreen}
                options={{ title: 'อนุมัติไรเดอร์' }}
            />
        </Stack.Navigator>
    );
}
