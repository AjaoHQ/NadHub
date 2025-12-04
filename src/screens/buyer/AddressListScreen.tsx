import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, Address } from '../../store/auth';
import { Ionicons } from '@expo/vector-icons';

export default function AddressListScreen() {
    const navigation = useNavigation();
    const { user, setDefaultAddress, removeAddress } = useAuth();
    const addresses = user?.addresses || [];

    const handleAddAddress = () => {
        navigation.navigate('EditAddress' as never);
    };

    const handleEditAddress = (address: Address) => {
        // Pass existing address to edit
        navigation.navigate('EditAddress' as never, { address } as never);
    };

    const renderItem = ({ item }: { item: Address }) => (
        <View style={[styles.card, item.isDefault && styles.defaultCard]}>
            <View style={styles.cardContent}>
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{item.label}</Text>
                    {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>ค่าเริ่มต้น</Text></View>}
                </View>
                <Text style={styles.address}>{item.fullAddress}</Text>
            </View>

            <View style={styles.actions}>
                {!item.isDefault && (
                    <TouchableOpacity onPress={() => setDefaultAddress(item.id)} style={styles.actionButton}>
                        <Text style={styles.actionText}>ตั้งเป็นหลัก</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleEditAddress(item)} style={styles.iconButton}>
                    <Ionicons name="pencil-outline" size={20} color="#36D873" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeAddress(item.id)} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={20} color="#FF5C5C" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={addresses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>คุณยังไม่มีที่อยู่จัดส่ง</Text>
                        <Text style={styles.emptySubText}>เพิ่มที่อยู่ใหม่เพื่อความสะดวกในการสั่งซื้อ</Text>
                    </View>
                }
            />

            <Pressable style={styles.addButton} onPress={handleAddAddress}>
                <Ionicons name="add" size={24} color="#001010" />
                <Text style={styles.addButtonText}>เพิ่มที่อยู่ใหม่</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E3C33',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    defaultCard: {
        borderColor: '#36D873',
        backgroundColor: '#001510',
    },
    cardContent: {
        flex: 1,
        marginRight: 12,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: '#36D873',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        fontSize: 10,
        color: '#001010',
        fontWeight: 'bold',
    },
    address: {
        fontSize: 14,
        color: '#B0B0B0',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionText: {
        color: '#36D873',
        fontSize: 12,
    },
    iconButton: {
        padding: 4,
    },
    addButton: {
        position: 'absolute',
        bottom: 24,
        right: 16,
        left: 16,
        backgroundColor: '#36D873',
        borderRadius: 999,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#36D873',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#001010',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#6A7A7A',
    },
});
