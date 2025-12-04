import React from 'react';

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth, MerchantProfile } from '../../store/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MerchantProductStackParamList, MerchantTabParamList, MerchantStackParamList } from '../../types';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { useProducts, Product } from '../../store/products';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<MerchantProductStackParamList, 'ProductList'>,
    CompositeNavigationProp<
        BottomTabNavigationProp<MerchantTabParamList>,
        NativeStackNavigationProp<MerchantStackParamList>
    >
>;

export default function ProductListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { products, deleteProduct, isLoading: productsLoading } = useProducts();
    const { user } = useAuth();

    React.useEffect(() => {
        if (user?.role === 'merchant') {
            const merchant = user as MerchantProfile;
            // Check if critical info is missing
            if (!merchant.addressLine || (!merchant.idCardNumber && !merchant.taxId)) {
                // Redirect to signup
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MerchantSignup' as any }],
                });
            }
        }
    }, [user]);

    if (productsLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>กำลังโหลดสินค้า...</Text>
            </View>
        );
    }

    const handleDelete = (id: string) => {
        Alert.alert(
            "ยืนยันการลบ",
            "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?",
            [
                { text: "ยกเลิก", style: "cancel" },
                { text: "ลบ", style: "destructive", onPress: () => deleteProduct(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: Product }) => {
        // Use the first image URI if available, otherwise fallback
        const imageSource = item.imageUris && item.imageUris.length > 0
            ? { uri: item.imageUris[0] }
            : { uri: 'https://via.placeholder.com/100' };

        return (
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.image} />
                    {item.videoUri && (
                        <View style={styles.videoIndicator}>
                            <Ionicons name="videocam" size={12} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>{item.price} บาท</Text>
                    <Text style={styles.category}>{item.categoryId}</Text>
                    {item.promotion ? <Text style={styles.promotion}>{item.promotion}</Text> : null}
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                    >
                        <Text style={styles.editButtonText}>แก้ไข</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Text style={styles.deleteButtonText}>ลบ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text style={styles.addButtonText}>
                    + เพิ่มสินค้าใหม่
                </Text>
            </TouchableOpacity>

            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีสินค้า</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    addButton: {
        backgroundColor: '#34C759',
        margin: 16,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    videoIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 2,
        borderTopLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    category: {
        fontSize: 12,
        color: '#666',
    },
    promotion: {
        fontSize: 12,
        color: '#FF3B30',
    },
    actions: {
        flexDirection: 'column',
        gap: 8,
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#007AFF',
        borderRadius: 4,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FF3B30',
        borderRadius: 4,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});
