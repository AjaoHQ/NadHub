import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useProducts } from '../../store/products';
import { useAuth } from '../../store/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCT_CATEGORIES, ProductCategoryId } from '../../constants/categories';

export default function AddProductScreen() {
    const navigation = useNavigation();
    const { addProduct } = useProducts();
    const { user } = useAuth();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [categoryId, setCategoryId] = useState<ProductCategoryId | null>(null); // Default null to force selection
    const [promotion, setPromotion] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [videoUri, setVideoUri] = useState<string | undefined>(undefined);

    const resetForm = () => {
        setName('');
        setPrice('');
        setCategoryId(null);
        setPromotion('');
        setImageUris([]);
        setVideoUri(undefined);
    };

    useFocusEffect(
        useCallback(() => {
            resetForm();
        }, [])
    );

    const pickImages = async () => {
        if (imageUris.length >= 5) {
            Alert.alert('ข้อจำกัด', 'เพิ่มรูปได้สูงสุด 5 รูป');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - imageUris.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImageUris(prev => [...prev, ...newUris].slice(0, 5));
        }
    };

    const pickVideo = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            videoMaxDuration: 60,
        });

        if (!result.canceled) {
            setVideoUri(result.assets[0].uri);
        }
    };

    const removeImage = (index: number) => {
        setImageUris(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อสินค้า');
            return;
        }
        if (!price.trim()) {
            Alert.alert('ข้อผิดพลาด', 'กรุณาระบุราคา');
            return;
        }
        if (!categoryId) {
            Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกหมวดหมู่สินค้า');
            return;
        }
        if (imageUris.length === 0) {
            Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกรูปสินค้าอย่างน้อย 1 รูป');
            return;
        }

        const priceNum = parseFloat(price);

        addProduct({
            name,
            price: isNaN(priceNum) ? 0 : priceNum,
            categoryId,
            promotion: promotion.trim() || undefined,
            imageUris,
            videoUri,
            merchantName: user?.merchantName || user?.displayName || 'Unknown Shop',
            merchantId: user?.id || 'unknown',
        });

        Alert.alert('สำเร็จ', 'บันทึกสินค้าเรียบร้อยแล้ว', [
            { text: 'เพิ่มต่อ', onPress: () => resetForm() },
            { text: 'กลับหน้ารายการ', onPress: () => { resetForm(); navigation.goBack(); } }
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.mediaSection}>
                <Text style={styles.sectionTitle}>รูปสินค้า ({imageUris.length}/5)</Text>
                <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageListContent}>
                    {imageUris.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                                <Ionicons name="close-circle" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {imageUris.length < 5 && (
                        <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                            <Ionicons name="camera" size={32} color="#666" />
                            <Text style={styles.addImageText}>เพิ่มรูป</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                <Text style={styles.sectionTitle}>วิดีโอ (ไม่เกิน 1 นาที)</Text>
                {videoUri ? (
                    <View style={styles.videoWrapper}>
                        <View style={styles.videoPlaceholder}>
                            <Ionicons name="videocam" size={40} color="#fff" />
                            <Text style={styles.videoText}>เลือกวิดีโอแล้ว</Text>
                        </View>
                        <TouchableOpacity style={styles.removeVideoButton} onPress={() => setVideoUri(undefined)}>
                            <Text style={styles.removeVideoText}>ลบวิดีโอ</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addVideoButton} onPress={pickVideo}>
                        <Ionicons name="videocam-outline" size={24} color="#007AFF" />
                        <Text style={styles.addVideoText}>เพิ่มวิดีโอสินค้า</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>ชื่อสินค้า</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="เช่น ข้าวมันไก่"
                />

                <Text style={styles.label}>ราคา (บาท)</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>หมวดหมู่</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipSelected]}
                            onPress={() => setCategoryId(cat.id)}
                        >
                            <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextSelected]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>โปรโมชั่น (ถ้ามี)</Text>
                <TextInput
                    style={styles.input}
                    value={promotion}
                    onChangeText={setPromotion}
                    placeholder="เช่น ลด 10%"
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>บันทึกสินค้า</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mediaSection: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
    },
    imageList: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    imageListContent: {
        alignItems: 'center',
    },
    imageWrapper: {
        marginRight: 10,
        position: 'relative',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#ddd',
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    addImageText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    videoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
    },
    videoPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoText: {
        color: '#fff',
        marginLeft: 10,
    },
    removeVideoButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 4,
    },
    removeVideoText: {
        color: '#fff',
        fontSize: 12,
    },
    addVideoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        backgroundColor: '#f0f8ff',
    },
    addVideoText: {
        color: '#007AFF',
        marginLeft: 8,
        fontWeight: '600',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        color: '#333',
    },
    categoryTextSelected: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#34C759',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
