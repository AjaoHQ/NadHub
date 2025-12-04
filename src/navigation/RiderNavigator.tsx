import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RiderStackParamList } from '../types';
import RiderHomeScreen from '../screens/rider/RiderHomeScreen';
import RiderHistoryScreen from '../screens/rider/RiderHistoryScreen';
import RiderOrderDetailScreen from '../screens/rider/RiderOrderDetailScreen';
import RiderProfileScreen from '../screens/rider/RiderProfileScreen';
import RiderReviewsScreen from '../screens/rider/RiderReviewsScreen';
import RiderEditProfileScreen from '../screens/rider/RiderEditProfileScreen';
import RiderSignupScreen from '../screens/rider/RiderSignupScreen';
import { Ionicons } from '@expo/vector-icons';
import { NadHubLogoTitle } from '../components/NadHubLogoTitle';

import { useAuth, isRiderProfileComplete } from '../store/auth';

const Stack = createNativeStackNavigator<RiderStackParamList>();
const Tab = createBottomTabNavigator();

function RiderTabs() {
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
                    if (route.name === 'RiderHome') iconName = 'bicycle-outline';
                    else if (route.name === 'RiderHistory') iconName = 'list-outline';
                    else if (route.name === 'RiderProfile') iconName = 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="RiderHome"
                component={RiderHomeScreen}
                options={{ title: 'รับงาน' }}
            />
            <Tab.Screen
                name="RiderHistory"
                component={RiderHistoryScreen}
                options={{ title: 'งานของฉัน' }}
            />
            <Tab.Screen
                name="RiderProfile"
                component={RiderProfileScreen}
                options={{ title: 'โปรไฟล์' }}
            />
        </Tab.Navigator>
    );
}

export default function RiderNavigator() {
    const { user } = useAuth();

    const profileComplete =
        user?.role === "rider" &&
        (user as any)?.isRiderProfileComplete === true;

    const initialRouteName = profileComplete ? "RiderTabs" : "RiderSignup";

    return (
        <Stack.Navigator
            key={initialRouteName} // Force re-render when initial route changes
            initialRouteName={initialRouteName}
        >
            <Stack.Screen
                name="RiderTabs"
                component={RiderTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RiderOrderDetail"
                component={RiderOrderDetailScreen}
                options={{ title: 'รายละเอียดงาน' }}
            />
            <Stack.Screen
                name="RiderHistory"
                component={RiderHistoryScreen}
                options={{ title: 'ประวัติงาน' }}
            />
            <Stack.Screen
                name="RiderReviews"
                component={RiderReviewsScreen}
                options={{ title: 'รีวิวจากลูกค้า' }}
            />
            <Stack.Screen
                name="RiderEditProfile"
                component={RiderEditProfileScreen}
                options={{ title: 'แก้ไขโปรไฟล์' }}
            />
            <Stack.Screen
                name="RiderSignup"
                component={RiderSignupScreen}
                options={{ title: 'ลงทะเบียนไรเดอร์', headerLeft: () => null, gestureEnabled: false }}
            />
        </Stack.Navigator>
    );
}
