import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export type RootStackParamList = {
    AuthFlow: undefined;
    MainFlow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const isOnboarded = !!(user && user.displayName);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isOnboarded ? (
                <Stack.Screen name="AuthFlow" component={AuthNavigator} />
            ) : (
                <Stack.Screen name="MainFlow" component={MainNavigator} />
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
