import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BuyerStackParamList } from '../../types';
import { useProducts, Product } from '../../store/products';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'BuyerHome'>;

import NadHubLogoHeader from '../../components/NadHubLogoHeader';

export default function BuyerHomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { products } = useProducts();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '', // Hide default title if we have a custom logo header
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('BuyerTabs', { screen: 'BuyerOrders' } as never)}>
                    <Text style={styles.headerButton}>คำสั่งซื้อของฉัน</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const renderItem = ({ item }: { item: Product }) => {
        const imageSource = item.imageUris && item.imageUris.length > 0
            ? { uri: item.imageUris[0] }
            : { uri: 'https://via.placeholder.com/100' };

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
                <Image source={imageSource} style={styles.image} />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.price}>{item.price} บาท</Text>
                    {item.promotion ? <Text style={styles.promotion}>{item.promotion}</Text> : null}
                </View>
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.logoWrapper}>
            <NadHubLogoHeader size="large" />
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                columnWrapperStyle={styles.columnWrapper}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีสินค้าในขณะนี้</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    logoWrapper: {
        alignItems: 'center',
        marginVertical: 20,
    },
    list: {
        padding: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },
    info: {
        padding: 10,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        height: 40,
    },
    price: {
        fontSize: 16,
        color: '#34C759',
        fontWeight: 'bold',
    },
    promotion: {
        fontSize: 12,
        color: '#FF3B30',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
        fontSize: 16,
    },
    headerButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
