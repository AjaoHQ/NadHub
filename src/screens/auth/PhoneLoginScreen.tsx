import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../store/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

export default function PhoneLoginScreen({ navigation }: Props) {
    const [phone, setPhone] = useState('');
    const { loginWithPhone } = useAuth();

    const handleLogin = async () => {
        const cleanedPhone = phone.replace(/[^0-9]/g, '');

        if (cleanedPhone.length < 9) {
            Alert.alert('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ให้ครบถ้วน');
            return;
        }

        await loginWithPhone(cleanedPhone);
        Alert.alert('OTP Sent', 'ใช้รหัส 123456 ในหน้าถัดไป (Demo)');
        navigation.navigate('OtpVerify', { phone: cleanedPhone });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>เข้าสู่ระบบด้วยเบอร์โทร</Text>
            <Text style={styles.subtitle}>กรุณากรอกเบอร์โทรศัพท์เพื่อรับรหัส OTP</Text>

            <TextInput
                style={styles.input}
                placeholder="เบอร์โทรศัพท์ (เช่น 0812345678)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={10}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>ขอรหัส OTP</Text>
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
        fontSize: 18,
        marginBottom: 24,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
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
