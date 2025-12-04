import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function MerchantEarningsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>รายได้วันนี้</Text>
                <Text style={styles.amount}>฿1,250.00</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>รายได้สัปดาห์นี้</Text>
                <Text style={styles.amount}>฿8,400.00</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>รายได้รวมทั้งหมด</Text>
                <Text style={[styles.amount, styles.totalAmount]}>฿45,200.00</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    totalAmount: {
        color: '#34C759',
    },
});
