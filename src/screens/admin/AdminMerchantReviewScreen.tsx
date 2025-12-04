import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { User, MERCHANT_STATUS } from '../../store/auth';

export default function AdminMerchantReviewScreen() {
    const [merchants, setMerchants] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadMerchants = async () => {
        setLoading(true);
        try {
            const USERS_DB_KEY = "nadHubUsers";
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            const usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const pendingMerchants = usersDb.filter(u =>
                u.role === 'merchant' &&
                (u as any).merchantStatus === MERCHANT_STATUS.PENDING
            );
            setMerchants(pendingMerchants);
        } catch (error) {
            console.error("Failed to load merchants", error);
            Alert.alert("Error", "Failed to load merchants");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadMerchants();
        }, [])
    );

    const handleUpdateStatus = async (merchantId: string, status: 'approved' | 'rejected') => {
        try {
            const USERS_DB_KEY = "nadHubUsers";
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            let usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const index = usersDb.findIndex(u => u.id === merchantId);
            if (index !== -1) {
                usersDb[index] = {
                    ...usersDb[index],
                    merchantStatus: status,
                    verificationStatus: status // Legacy support
                } as any;
                await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

                Alert.alert("Success", `Merchant ${status} successfully`);
                loadMerchants(); // Reload list
            }
        } catch (error) {
            console.error("Failed to update merchant status", error);
            Alert.alert("Error", "Failed to update status");
        }
    };

    const renderItem = ({ item }: { item: User }) => {
        const merchant = item as any;
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                        {merchant.merchantImage ? (
                            <Image source={{ uri: merchant.merchantImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {(merchant.merchantName || merchant.displayName || "S").charAt(0)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.shopName}>{merchant.merchantName || merchant.displayName}</Text>
                        <Text style={styles.ownerName}>Owner: {merchant.ownerName || merchant.displayName}</Text>
                        <Text style={styles.phone}>{merchant.phone}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>Tax ID: {merchant.taxId || '-'}</Text>
                    <Text style={styles.detailText}>ID Card: {merchant.idCardNumber || '-'}</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus(merchant.id, 'rejected')}
                    >
                        <Text style={styles.actionButtonText}>ปฏิเสธ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleUpdateStatus(merchant.id, 'approved')}
                    >
                        <Text style={styles.actionButtonText}>อนุมัติ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={merchants}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>ไม่มีร้านค้าที่รอการอนุมัติ</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8E8E93',
    },
    headerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    shopName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    ownerName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    phone: {
        fontSize: 14,
        color: '#8E8E93',
    },
    detailsContainer: {
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: '#34C759',
    },
    rejectButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
    },
});
