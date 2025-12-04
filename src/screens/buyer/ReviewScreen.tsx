import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BuyerStackParamList } from '../../types';
import { useOrders } from '../../store/orders';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList, 'Review'>;
type ScreenRouteProp = RouteProp<BuyerStackParamList, 'Review'>;

export default function ReviewScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { orderId } = route.params;
    const { orders, addOrderRating } = useOrders();

    const order = orders.find(o => o.id === orderId);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [complaint, setComplaint] = useState('');

    if (!order) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>ไม่พบคำสั่งซื้อ</Text>
            </View>
        );
    }

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('กรุณาให้คะแนน', 'โปรดเลือกจำนวนดาวที่ต้องการให้');
            return;
        }

        addOrderRating(orderId, rating, comment, complaint);

        Alert.alert(
            'บันทึกสำเร็จ',
            'ขอบคุณสำหรับการรีวิว',
            [
                {
                    text: 'ตกลง',
                    onPress: () => navigation.goBack()
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.shopName}>{order.storeName}</Text>
                <Text style={styles.orderInfo}>คำสั่งซื้อ #{order.id.slice(-6)}</Text>
            </View>

            <View style={styles.ratingSection}>
                <Text style={styles.label}>ให้คะแนนร้านค้า</Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name={star <= rating ? "star" : "star-outline"}
                                size={40}
                                color="#FBC02D"
                                style={styles.starIcon}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.ratingText}>{rating} ดาว</Text>
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.label}>ความคิดเห็นเพิ่มเติม (ถ้ามี)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="รสชาติอาหาร, ความรวดเร็ว, ฯลฯ"
                    placeholderTextColor="#6A7A7A"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.label}>ข้อเสนอแนะ / ร้องเรียน (ถ้ามี)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="แจ้งปัญหาที่พบ..."
                    placeholderTextColor="#6A7A7A"
                    value={complaint}
                    onChangeText={setComplaint}
                    multiline
                    numberOfLines={3}
                />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>ส่งรีวิว</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
        padding: 16,
    },
    errorText: {
        color: '#FF5C5C',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    orderInfo: {
        fontSize: 14,
        color: '#6A7A7A',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 12,
        fontWeight: '600',
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    starIcon: {
        marginHorizontal: 4,
    },
    ratingText: {
        fontSize: 18,
        color: '#FBC02D',
        fontWeight: 'bold',
    },
    inputSection: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        borderRadius: 12,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    submitButton: {
        backgroundColor: '#36D873',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        color: '#001010',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
