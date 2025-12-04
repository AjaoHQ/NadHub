import React, { useState, useLayoutEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, User } from "../../store/auth";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function RiderEditProfileScreen() {
    const navigation = useNavigation();
    const { user, updateProfile, refreshUser } = useAuth();

    const rider = user as any; // Cast to access rider specific fields
    const [name, setName] = useState(user?.riderName || user?.displayName || "");
    const [vehicleType, setVehicleType] = useState(rider?.vehicleType ?? "");
    const [plateNumber, setPlateNumber] = useState(rider?.plateNumber ?? "");
    const [image, setImage] = useState<string | null>(user?.riderImage ?? null);

    // Phone is read-only for now as it's the unique ID
    const phone = user?.phone ?? "";

    const hasChanged =
        name !== (user?.riderName || user?.displayName || "") ||
        vehicleType !== (rider?.vehicleType ?? "") ||
        plateNumber !== (rider?.plateNumber ?? "") ||
        image !== (user?.riderImage ?? null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "แก้ไขโปรไฟล์ไรเดอร์",
        });
    }, [navigation]);

    // Refresh user data on mount
    React.useEffect(() => {
        refreshUser();
    }, []);

    // Sync local state when user updates
    React.useEffect(() => {
        if (user) {
            setName(user.riderName || user.displayName || "");
            setVehicleType((user as any).vehicleType ?? "");
            setPlateNumber((user as any).plateNumber ?? "");
            setImage(user.riderImage ?? null);
        }
    }, [user]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            // TODO: Show error toast
            return;
        }

        await updateProfile({
            riderName: name.trim(),
            role: "rider",
            vehicleType: vehicleType.trim(),
            plateNumber: plateNumber.trim(),
            riderImage: image,
        });

        await refreshUser();
        navigation.goBack();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="camera" size={32} color="#6A7A7A" />
                        </View>
                    )}
                    <View style={styles.editIcon}>
                        <Ionicons name="pencil" size={12} color="#fff" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>ชื่อแสดง</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="ระบุชื่อที่จะแสดงใน NadHub"
                    placeholderTextColor="#6A7A7A"
                    style={styles.input}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>เบอร์โทรศัพท์ (ไม่สามารถแก้ไขได้)</Text>
                <TextInput
                    value={phone}
                    editable={false}
                    placeholder="ระบุเบอร์โทรศัพท์"
                    placeholderTextColor="#6A7A7A"
                    style={[styles.input, styles.disabledInput]}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>ประเภทพาหนะ</Text>
                <TextInput
                    value={vehicleType}
                    onChangeText={setVehicleType}
                    placeholder="เช่น มอเตอร์ไซค์, รถยนต์"
                    placeholderTextColor="#6A7A7A"
                    style={styles.input}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>ทะเบียนรถ</Text>
                <TextInput
                    value={plateNumber}
                    onChangeText={setPlateNumber}
                    placeholder="เช่น 1กข 1234"
                    placeholderTextColor="#6A7A7A"
                    style={styles.input}
                />
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={[
                        styles.saveButton,
                        !hasChanged && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanged}
                >
                    <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000608",
    },
    content: {
        padding: 16,
        paddingBottom: 24,
        gap: 16,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#36D873',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#36D873',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000608',
    },
    changePhotoText: {
        color: '#36D873',
        fontSize: 14,
        marginTop: 8,
    },
    section: {
        gap: 6,
    },
    label: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#02090A",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#1E3C33",
        color: "#FFFFFF",
        fontSize: 14,
    },
    disabledInput: {
        backgroundColor: "#111",
        color: "#6A7A7A",
    },
    footer: {
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: "#36D873",
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: "center",
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: "#001010",
        fontSize: 14,
        fontWeight: "700",
    },
});
