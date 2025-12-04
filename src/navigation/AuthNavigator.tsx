import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PhoneLoginScreen from '../screens/auth/PhoneLoginScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

export type AuthStackParamList = {
    PhoneLogin: undefined;
    OtpVerify: { phone: string };
    ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="PhoneLogin"
                component={PhoneLoginScreen}
                options={{ title: 'เข้าสู่ระบบ' }}
            />
            <Stack.Screen
                name="OtpVerify"
                component={OtpVerifyScreen}
                options={{ title: 'ยืนยันรหัส OTP' }}
            />
            <Stack.Screen
                name="ProfileSetup"
                component={ProfileSetupScreen}
                options={{ title: 'ตั้งชื่อโปรไฟล์' }}
            />
        </Stack.Navigator>
    );
}
