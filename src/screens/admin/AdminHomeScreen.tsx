import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/auth';

export default function AdminHomeScreen() {
    const navigation = useNavigation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Panel</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
                {/* Merchant Approval Removed */}

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => navigation.navigate('AdminRiderReview' as never)}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#FF9500' }]}>
                        <Ionicons name="bicycle" size={24} color="#fff" />
                    </View>
                    <View style={styles.menuContent}>
                        <Text style={styles.menuTitle}>อนุมัติไรเดอร์</Text>
                        <Text style={styles.menuSubtitle}>ตรวจสอบและอนุมัติไรเดอร์ใหม่</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    menuContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
    },
});
