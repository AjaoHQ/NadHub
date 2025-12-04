import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth, Address } from '../../store/auth';

type EditAddressRouteProp = RouteProp<{ params: { address?: Address } }, 'params'>;

export default function EditAddressScreen() {
    const navigation = useNavigation();
    const route = useRoute<EditAddressRouteProp>();
    const { addAddress, removeAddress } = useAuth(); // We'll simulate edit by remove + add for simplicity or add updateAddress later
    const existingAddress = route.params?.address;

    const [label, setLabel] = useState(existingAddress?.label || '');
    const [fullAddress, setFullAddress] = useState(existingAddress?.fullAddress || '');

    useLayoutEffect(() => {
        navigation.setOptions({
            title: existingAddress ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่',
        });
    }, [navigation, existingAddress]);

    const handleSave = async () => {
        if (!label.trim() || !fullAddress.trim()) {
            Alert.alert('ข้อมูลไม่ครบ', 'กรุณาระบุชื่อสถานที่และที่อยู่ให้ครบถ้วน');
            return;
        }

        if (existingAddress) {
            // Simple update: remove old, add new (preserving ID would be better with a real update function)
            // For this sprint, let's just add a new one and remove the old one to simulate update, 
            // OR ideally add updateAddress to store. 
            // Let's just add new for now as "Edit" implies creating a new version in this simple MVP.
            // Actually, let's do it properly:
            await removeAddress(existingAddress.id);
        }

        await addAddress({
            label: label.trim(),
            fullAddress: fullAddress.trim(),
            isDefault: existingAddress?.isDefault || false,
        });

        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <Text style={styles.label}>ชื่อสถานที่ (เช่น บ้าน, ที่ทำงาน)</Text>
                <TextInput
                    value={label}
                    onChangeText={setLabel}
                    placeholder="ระบุชื่อสถานที่"
                    placeholderTextColor="#6A7A7A"
                    style={styles.input}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>รายละเอียดที่อยู่</Text>
                <TextInput
                    value={fullAddress}
                    onChangeText={setFullAddress}
                    placeholder="บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด"
                    placeholderTextColor="#6A7A7A"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>บันทึกที่อยู่</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    content: {
        padding: 16,
        gap: 20,
    },
    section: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        borderRadius: 12,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#36D873',
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#001010',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
