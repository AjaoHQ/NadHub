import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MerchantStackParamList } from '../../types'; // We will create this type soon
import { useAuth } from '../../store/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Temporary type until we update types.ts
type NavigationProp = NativeStackNavigationProp<any, 'MerchantSignup'>;

export default function MerchantSignupScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, updateProfile, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [displayName, setDisplayName] = useState(user?.merchantName || user?.displayName || '');
    const [ownerName, setOwnerName] = useState('');
    const [addressLine, setAddressLine] = useState(user?.addressLine || '');
    const [idCardNumber, setIdCardNumber] = useState('');
    const [taxId, setTaxId] = useState('');
    const [image, setImage] = useState<string | null>(user?.merchantImage || null);

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

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            Alert.alert('กรุณาระบุชื่อร้าน');
            return;
        }
        if (!ownerName.trim()) {
            Alert.alert('กรุณาระบุชื่อเจ้าของร้าน');
            return;
        }
        if (!addressLine.trim()) {
            Alert.alert('กรุณาระบุที่อยู่ร้าน');
            return;
        }
        if (!idCardNumber.trim() && !taxId.trim()) {
            Alert.alert('กรุณาระบุเลขบัตรประชาชน หรือ เลขผู้เสียภาษี อย่างน้อย 1 อย่าง');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                merchantName: displayName,
                ownerName,
                addressLine,
                idCardNumber,
                taxId,
                merchantImage: image,
                // No merchantStatus needed anymore
            } as any);

            await refreshUser();

            Alert.alert(
                "ลงทะเบียนสำเร็จ",
                "ข้อมูลร้านค้าของคุณได้รับการบันทึกเรียบร้อยแล้ว",
                [
                    {
                        text: "เริ่มจัดการร้าน",
                        onPress: () => navigation.replace('MerchantTabs' as any)
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ลงทะเบียนร้านค้า</Text>
                <Text style={styles.subtitle}>กรุณากรอกข้อมูลร้านค้าให้ครบถ้วน</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarPlaceholder}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.placeholderContent}>
                                <Ionicons name="storefront" size={32} color="#6A7A7A" />
                                <Text style={styles.placeholderText}>รูปร้านค้า</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={user?.phone}
                        editable={false}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ชื่อร้านค้า *</Text>
                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="ระบุชื่อร้านค้า"
                        placeholderTextColor="#6A7A7A"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ชื่อเจ้าของร้าน *</Text>
                    <TextInput
                        style={styles.input}
                        value={ownerName}
                        onChangeText={setOwnerName}
                        placeholder="ระบุชื่อ-นามสกุลเจ้าของร้าน"
                        placeholderTextColor="#6A7A7A"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ที่อยู่ร้าน *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={addressLine}
                        onChangeText={setAddressLine}
                        placeholder="ระบุที่อยู่ร้านโดยละเอียด"
                        placeholderTextColor="#6A7A7A"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>เลขบัตรประชาชน (บุคคลธรรมดา)</Text>
                    <TextInput
                        style={styles.input}
                        value={idCardNumber}
                        onChangeText={setIdCardNumber}
                        placeholder="ระบุเลข 13 หลัก"
                        placeholderTextColor="#6A7A7A"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>เลขผู้เสียภาษี (นิติบุคคล)</Text>
                    <TextInput
                        style={styles.input}
                        value={taxId}
                        onChangeText={setTaxId}
                        placeholder="ระบุเลขผู้เสียภาษี"
                        placeholderTextColor="#6A7A7A"
                        keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>* กรอกอย่างน้อย 1 ช่อง (บัตรประชาชน หรือ เลขผู้เสียภาษี)</Text>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#001010" />
                    ) : (
                        <Text style={styles.submitButtonText}>บันทึกข้อมูล</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    header: {
        padding: 24,
        backgroundColor: '#000A0A',
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6A7A7A',
    },
    form: {
        padding: 24,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 24,
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
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    placeholderContent: {
        alignItems: 'center',
    },
    placeholderText: {
        color: '#6A7A7A',
        fontSize: 12,
        marginTop: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: '#000A0A',
        color: '#6A7A7A',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    helperText: {
        color: '#6A7A7A',
        fontSize: 12,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#36D873',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#001010',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
