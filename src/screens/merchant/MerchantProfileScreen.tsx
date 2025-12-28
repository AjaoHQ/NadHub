import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert, TouchableOpacity, Image, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useAuth } from '../../store/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { MapPicker } from '../../components/MapPicker';
import { getShopPin, saveShopPin } from '../../services/pins';
import { PinLocation } from '../../types/pins';

export default function MerchantProfileScreen() {
    const { user, updateProfile, logout, refreshUser } = useAuth();
    const navigation = useNavigation();
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Shop Name Editing State
    const [shopName, setShopName] = useState(user?.merchantName || user?.displayName || "");
    const [isEditingName, setIsEditingName] = useState(false);

    // Shop Pin State
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [shopPin, setShopPin] = useState<PinLocation | null>(null);

    useFocusEffect(
        useCallback(() => {
            refreshUser();
            loadShopPin();
        }, [])
    );

    const loadShopPin = async () => {
        if (user?.id) {
            const pin = await getShopPin(user.id);
            if (pin) {
                setShopPin(pin);
            }
        }
    };

    useEffect(() => {
        if (user?.merchantImage) {
            setImage(user.merchantImage);
        }
        if (user?.merchantName) {
            setShopName(user.merchantName);
        } else if (user?.displayName) {
            setShopName(user.displayName);
        }
        if (user?.role === 'merchant') {
            setIsOpen((user as any).isOpen ?? true);
        }
    }, [user?.id, user?.merchantImage, user?.displayName, user?.merchantName, (user as any)?.isOpen]);

    useEffect(() => {
        if (!user || user.role !== 'merchant') {
            navigation.reset({
                index: 0,
                routes: [{ name: 'RoleSelector' as never }],
            });
        }
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;

        // Validation for Shop Name
        const trimmedName = shopName.trim();
        if (!trimmedName) {
            Alert.alert("ข้อผิดพลาด", "ชื่อร้านค้าห้ามว่าง");
            return;
        }
        if (trimmedName.length > 30) {
            Alert.alert("ข้อผิดพลาด", "ชื่อร้านค้าต้องไม่เกิน 30 ตัวอักษร");
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({
                merchantImage: image,
                merchantName: trimmedName
            });
            await refreshUser();
            setIsEditingName(false);
            Alert.alert("บันทึกสำเร็จ", "อัปเดตข้อมูลร้านเรียบร้อยแล้ว");
        } catch (error) {
            console.error("Failed to save profile", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePinConfirm = async (newPin: PinLocation) => {
        if (!user?.id) return;
        const success = await saveShopPin(user.id, newPin);
        if (success) {
            setShopPin(newPin);
            setShowMapPicker(false);
            Alert.alert("สำเร็จ", "บันทึกพิกัดร้านค้าแล้ว");
        } else {
            Alert.alert("ผิดพลาด", "ไม่สามารถบันทึกพิกัดได้");
        }
    };

    const handleToggleOpen = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        const newState = !isOpen;
        setIsOpen(newState);

        try {
            // Update internal user state
            await updateProfile({ isOpen: newState });

            Alert.alert(
                newState ? "เปิดร้านแล้ว" : "ปิดร้านชั่วคราว",
                newState
                    ? "ลูกค้าสามารถสั่งซื้อสินค้าได้ตามปกติ"
                    : "ลูกค้าจะเห็นว่าร้านปิดและไม่สามารถสั่งซื้อได้"
            );
        } catch (error) {
            console.error("Failed to update status", error);
            setIsOpen(!newState); // Revert on error
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะร้านได้");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบใช่หรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ออกจากระบบ",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const hasChanges = image !== user?.merchantImage || shopName !== (user?.merchantName || user?.displayName);

    const renderProfileHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {(user?.merchantName || user?.displayName || "S").charAt(0)}
                        </Text>
                    </View>
                )}
                <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={16} color="#fff" />
                </View>
            </TouchableOpacity>

            {isEditingName ? (
                <View style={styles.nameEditContainer}>
                    <TextInput
                        style={styles.nameInput}
                        value={shopName}
                        onChangeText={setShopName}
                        placeholder="ชื่อร้านค้า"
                        maxLength={30}
                        autoFocus
                    />
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.nameContainer}
                    onPress={() => setIsEditingName(true)}
                >
                    <Text style={styles.shopName}>{shopName || "ชื่อร้านค้า"}</Text>
                    <Ionicons name="pencil" size={16} color="#007AFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            )}

            <Text style={styles.phone}>{user?.phone}</Text>

            {hasChanges && (
                <View style={styles.saveContainer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>บันทึกการเปลี่ยนแปลง</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const DEFAULT_LAT = 13.7563;
    const DEFAULT_LNG = 100.5018;

    const safeLat = shopPin?.latitude ?? shopPin?.lat ?? DEFAULT_LAT;
    const safeLng = shopPin?.longitude ?? shopPin?.lng ?? DEFAULT_LNG;

    const region: Region = {
        latitude: safeLat,
        longitude: safeLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                {renderProfileHeader()}
            </View>

            <View style={styles.menuSection}>
                {/* Shop Location Section with Mini Map */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>ที่ตั้งร้านค้า</Text>
                        <TouchableOpacity onPress={() => setShowMapPicker(true)}>
                            <Text style={styles.editText}>แก้ไข</Text>
                        </TouchableOpacity>
                    </View>

                    {shopPin ? (
                        <View style={styles.mapPreviewContainer}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.miniMap}
                                region={region}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                liteMode={true} // Use Lite Mode for better performance in lists/static views on Android
                            >
                                <Marker coordinate={{ latitude: safeLat, longitude: safeLng }} />
                            </MapView>
                            <View style={styles.addressOverlay}>
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {shopPin.addressText || `${safeLat.toFixed(4)}, ${safeLng.toFixed(4)}`}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addPinButton} onPress={() => setShowMapPicker(true)}>
                            <Ionicons name="location-outline" size={24} color="#007AFF" />
                            <Text style={styles.addPinText}>ตั้งค่าร้านค้าบนแผนที่</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>สถานะร้านค้า</Text>
                    <View style={styles.row}>
                        <View style={styles.rowInfo}>
                            <Ionicons
                                name={isOpen ? "storefront" : "storefront-outline"}
                                size={24}
                                color={isOpen ? "#34C759" : "#8E8E93"}
                            />
                            <View style={styles.textWrapper}>
                                <Text style={styles.rowLabel}>
                                    {isOpen ? "เปิดให้บริการ" : "ปิดชั่วคราว"}
                                </Text>
                                <Text style={styles.rowSubLabel}>
                                    {isOpen ? "ลูกค้าสามารถสั่งซื้อได้" : "งดรับออเดอร์ชั่วคราว"}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#767577", true: "#34C759" }}
                            thumbColor={isOpen ? "#fff" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleToggleOpen}
                            value={isOpen}
                            disabled={isLoading}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>บัญชี</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        <Text style={[styles.menuText, { color: '#FF3B30' }]}>ออกจากระบบ</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={showMapPicker} animationType="slide">
                <MapPicker
                    label="ปักหมุดตำแหน่งร้านค้า"
                    placeholderNote="รายละเอียดเพิ่มเติม (เช่น ตึก, ชั้น, ซอย)"
                    initialPin={shopPin || undefined}
                    onConfirm={handlePinConfirm}
                    onCancel={() => setShowMapPicker(false)}
                />
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    profileSection: {
        marginBottom: 20,
    },
    menuSection: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginBottom: 0,
    },
    avatarContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#34C759',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    shopName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    phone: {
        fontSize: 14,
        color: '#8E8E93',
    },
    saveContainer: {
        paddingHorizontal: 16,
        marginTop: 10,
        width: '100%',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
        paddingBottom: 8,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 16,
    },
    sectionTitle: {
        fontSize: 13,
        color: '#8E8E93',
        textTransform: 'uppercase',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    editText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textWrapper: {
        marginLeft: 12,
        flex: 1,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    rowSubLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
        color: '#000',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameEditContainer: {
        width: '80%',
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#007AFF',
        paddingBottom: 4,
    },
    mapPreviewContainer: {
        height: 150,
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    miniMap: {
        width: '100%',
        height: '100%',
    },
    addressOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
    },
    addressText: {
        color: '#fff',
        fontSize: 12,
    },
    addPinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#C7C7CC',
        margin: 16,
        borderRadius: 8,
    },
    addPinText: {
        marginLeft: 8,
        color: '#007AFF',
        fontSize: 16,
    }
});
