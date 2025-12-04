import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../store/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ route, navigation }: Props) {
    const { phone } = route.params;
    const [code, setCode] = useState('');
    const { verifyOtp } = useAuth();

    const handleVerify = async () => {
        if (code.length !== 6) {
            Alert.alert('รหัสไม่ถูกต้อง', 'กรุณากรอกรหัส OTP 6 หลัก');
            return;
        }

        const success = await verifyOtp(code);
        if (success) {
            // Navigation will be handled by RootNavigator based on user state
            // But we need to push to ProfileSetup if displayName is empty.
            // Actually, RootNavigator checks `isOnboarded = !!(user && user.displayName)`.
            // So if we just verified OTP, user is created but displayName is empty.
            // RootNavigator will still show AuthFlow.
            // So we manually navigate to ProfileSetup.
            navigation.replace('ProfileSetup');
        } else {
            Alert.alert('รหัสไม่ถูกต้อง', 'กรุณาตรวจสอบรหัส OTP อีกครั้ง');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ยืนยันรหัส OTP</Text>
            <Text style={styles.subtitle}>ส่งรหัสไปที่ {phone}</Text>

            <TextInput
                style={styles.input}
                placeholder="รหัส OTP 6 หลัก"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={6}
            />

            <Text style={styles.hint}>เดโม: ใช้รหัส 123456</Text>

            <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <Text style={styles.buttonText}>ยืนยัน</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 24,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        letterSpacing: 8,
    },
    hint: {
        textAlign: 'center',
        color: '#999',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
