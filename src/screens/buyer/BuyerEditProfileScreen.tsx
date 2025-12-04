import React, { useState, useLayoutEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "../../store/auth";
import { Ionicons } from '@expo/vector-icons';

export default function BuyerEditProfileScreen() {
    const navigation = useNavigation();
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState(user?.buyerName || user?.displayName || "");
    const [image, setImage] = useState<string | null>(user?.buyerImage ?? null);

    // Phone is read-only for now as it's the unique ID
    const phone = user?.phone ?? "";

    const hasChanged = name !== (user?.buyerName || user?.displayName || "") || image !== (user?.buyerImage ?? null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "แก้ไขโปรไฟล์",
        });
    }, [navigation]);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('ต้องการสิทธิ์', 'ขอสิทธิ์เข้าถึงคลังภาพเพื่อเปลี่ยนรูปโปรไฟล์');
            return;
        }

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
            Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อแสดง');
            return;
        }

        await updateProfile({
            buyerName: name.trim(),
            buyerImage: image,
        });

        navigation.goBack();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.avatarContainer}>
                <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.avatar} />
                    ) : (
                        <View style={styles.placeholderAvatar}>
                            <Ionicons name="person" size={40} color="#36D873" />
                        </View>
                    )}
                    <View style={styles.editIconBadge}>
                        <Ionicons name="camera" size={14} color="#000" />
                    </View>
                </Pressable>
                <Text style={styles.changePhotoText}>แตะเพื่อเปลี่ยนรูป</Text>
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

            <View style={styles.footer}>
                <Pressable
                    style={[
                        styles.saveButton,
                        !hasChanged && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanged}
                >
                    <Text style={styles.saveButtonText}>บันทึกการเปลี่ยนแปลง</Text>
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#36D873',
    },
    placeholderAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#02090A',
        borderWidth: 2,
        borderColor: '#36D873',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#36D873',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000608',
    },
    changePhotoText: {
        color: '#36D873',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '600',
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
