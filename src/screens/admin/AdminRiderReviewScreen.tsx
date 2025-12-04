import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../store/auth';

export default function AdminRiderReviewScreen() {
    const [riders, setRiders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRiders = async () => {
        setLoading(true);
        try {
            const USERS_DB_KEY = "nadHubUsers";
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            const usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const pendingRiders = usersDb.filter(u =>
                u.role === 'rider' &&
                (u as any).verificationStatus === 'pending_verification'
            );
            setRiders(pendingRiders);
        } catch (error) {
            console.error("Failed to load riders", error);
            Alert.alert("Error", "Failed to load riders");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadRiders();
        }, [])
    );

    const handleUpdateStatus = async (riderId: string, status: 'approved' | 'rejected') => {
        try {
            const USERS_DB_KEY = "nadHubUsers";
            const usersDbJson = await AsyncStorage.getItem(USERS_DB_KEY);
            let usersDb: User[] = usersDbJson ? JSON.parse(usersDbJson) : [];

            const index = usersDb.findIndex(u => u.id === riderId);
            if (index !== -1) {
                usersDb[index] = {
                    ...usersDb[index],
                    verificationStatus: status
                } as any;
                await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

                Alert.alert("Success", `Rider ${status} successfully`);
                loadRiders(); // Reload list
            }
        } catch (error) {
            console.error("Failed to update rider status", error);
            Alert.alert("Error", "Failed to update status");
        }
    };

    const renderItem = ({ item }: { item: User }) => {
        const rider = item as any;
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                        {rider.riderImage ? (
                            <Image source={{ uri: rider.riderImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>
                                    {(rider.displayName || "R").charAt(0)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{rider.displayName}</Text>
                        <Text style={styles.phone}>{rider.phone}</Text>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>Vehicle: {rider.vehicleType || '-'}</Text>
                    <Text style={styles.detailText}>Plate: {rider.plateNumber || '-'}</Text>
                    <Text style={styles.detailText}>ID Card: {rider.idCardNumber || '-'}</Text>
                    <Text style={styles.detailText}>License: {rider.licenseNumber || '-'}</Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus(rider.id, 'rejected')}
                    >
                        <Text style={styles.actionButtonText}>ปฏิเสธ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleUpdateStatus(rider.id, 'approved')}
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
                data={riders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>ไม่มีไรเดอร์ที่รอการอนุมัติ</Text>
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
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
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
