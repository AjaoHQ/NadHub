import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainNavigator';
import { useAuth, UserRole } from '../store/auth';

type Props = NativeStackScreenProps<MainStackParamList, 'RoleSelector'>;

export default function RoleSelectorScreen({ navigation }: Props) {
    const { user, loading, setRole, logout } = useAuth();

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centered}>
                <Text>ไม่มีข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>กลับไปหน้าเข้าสู่ระบบ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleRoleSelect = (role: UserRole) => {
        setRole(role);
        if (role === 'buyer') {
            navigation.navigate('BuyerMain');
        } else if (role === 'merchant') {
            navigation.navigate('MerchantMain');
        } else if (role === 'rider') {
            navigation.navigate('RiderMain');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                { text: "ออกจากระบบ", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>สวัสดี, {user.displayName}</Text>
                <Text style={styles.phoneText}>{user.phone}</Text>
                {user.role && <Text style={styles.roleText}>สถานะล่าสุด: {user.role}</Text>}
            </View>

            <Text style={styles.title}>เลือกบทบาทของคุณ</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.buyerButton]}
                    onPress={() => handleRoleSelect('buyer')}
                >
                    <Text style={styles.buttonText}>ผู้ซื้อ (Buyer)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.merchantButton]}
                    onPress={() => handleRoleSelect('merchant')}
                >
                    <Text style={styles.buttonText}>ร้านค้า (Merchant)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.riderButton]}
                    onPress={() => handleRoleSelect('rider')}
                >
                    <Text style={styles.buttonText}>ไรเดอร์ (Rider)</Text>
                </TouchableOpacity>

                {user.role === 'admin' && (
                    <TouchableOpacity
                        style={[styles.button, styles.adminButton]}
                        onPress={() => navigation.navigate('AdminMain')}
                    >
                        <Text style={styles.buttonText}>ผู้ดูแลระบบ (Admin)</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buyerButton: {
        backgroundColor: '#007AFF',
    },
    merchantButton: {
        backgroundColor: '#34C759',
    },
    riderButton: {
        backgroundColor: '#FF9500',
    },
    adminButton: {
        backgroundColor: '#5856D6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 40,
        padding: 12,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
});
