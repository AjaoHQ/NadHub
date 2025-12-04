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
import { RiderStackParamList } from '../../types';
import { useAuth, RiderProfile } from '../../store/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RiderSignup'>;

export default function RiderSignupScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { user, updateProfile, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Cast to any to access potential existing rider fields
    const riderData = user as any;
    const [displayName, setDisplayName] = useState(user?.riderName || user?.displayName || '');
    const [vehicleType, setVehicleType] = useState<string>(riderData?.vehicleType || 'motorcycle');
    const [plateNumber, setPlateNumber] = useState(riderData?.plateNumber || '');
    const [idCardNumber, setIdCardNumber] = useState(riderData?.idCardNumber || '');
    const [licenseNumber, setLicenseNumber] = useState(riderData?.licenseNumber || '');
    const [image, setImage] = useState<string | null>(user?.riderImage || null);

    React.useEffect(() => {
        refreshUser();
    }, []);

    // Sync state when user updates (e.g. after refresh)
    React.useEffect(() => {
        if (user) {
            const rData = user as any;
            setDisplayName(user.riderName || user.displayName || '');
            if (rData.vehicleType) setVehicleType(rData.vehicleType);
            if (rData.plateNumber) setPlateNumber(rData.plateNumber);
            if (rData.idCardNumber) setIdCardNumber(rData.idCardNumber);
            if (rData.licenseNumber) setLicenseNumber(rData.licenseNumber);
            if (user.riderImage) setImage(user.riderImage);
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

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            Alert.alert('กรุณาระบุชื่อ-นามสกุล');
            return;
        }
        if (!plateNumber.trim()) {
            Alert.alert('กรุณาระบุทะเบียนรถ');
            return;
        }
        if (!idCardNumber.trim()) {
            Alert.alert('กรุณาระบุเลขบัตรประชาชน');
            return;
        }
        if (!licenseNumber.trim()) {
            Alert.alert('กรุณาระบุเลขใบขับขี่');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                riderName: displayName,
                vehicleType,
                plateNumber,
                idCardNumber,
                licenseNumber,
                riderImage: image,
                // DEV ONLY: auto-approve rider for testing. TODO: move verification to backend.
                verificationStatus: 'approved',
                isRiderProfileComplete: true
            } as any); // Type assertion needed due to partial update complexity

            Alert.alert(
                "บันทึกข้อมูลสำเร็จ",
                "ข้อมูลของคุณได้รับการอนุมัติเรียบร้อยแล้ว (Dev Mode)",
                [
                    {
                        text: "เริ่มงานได้เลย",
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'RiderTabs' as never }],
                            });
                        }
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

    const VehicleOption = ({ type, label, icon }: { type: string, label: string, icon: string }) => (
        <TouchableOpacity
            style={[styles.vehicleOption, vehicleType === type && styles.vehicleOptionSelected]}
            onPress={() => setVehicleType(type)}
        >
            <Ionicons name={icon as any} size={24} color={vehicleType === type ? '#36D873' : '#6A7A7A'} />
            <Text style={[styles.vehicleLabel, vehicleType === type && styles.vehicleLabelSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ลงทะเบียนไรเดอร์</Text>
                <Text style={styles.subtitle}>กรุณากรอกข้อมูลให้ครบถ้วนเพื่อยืนยันตัวตน</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarPlaceholder}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.placeholderContent}>
                                <Ionicons name="camera" size={32} color="#6A7A7A" />
                                <Text style={styles.placeholderText}>รูปโปรไฟล์</Text>
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
                    <Text style={styles.label}>ชื่อ-นามสกุล *</Text>
                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="ระบุชื่อ-นามสกุลจริง"
                        placeholderTextColor="#6A7A7A"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ประเภทพาหนะ *</Text>
                    <View style={styles.vehicleGrid}>
                        <VehicleOption type="motorcycle" label="มอเตอร์ไซค์" icon="bicycle" />
                        <VehicleOption type="car" label="รถยนต์" icon="car" />
                        <VehicleOption type="bicycle" label="จักรยาน" icon="bicycle-outline" />
                        <VehicleOption type="other" label="อื่นๆ" icon="ellipsis-horizontal" />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>ทะเบียนรถ *</Text>
                    <TextInput
                        style={styles.input}
                        value={plateNumber}
                        onChangeText={setPlateNumber}
                        placeholder="เช่น 1กข 1234"
                        placeholderTextColor="#6A7A7A"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>เลขบัตรประชาชน *</Text>
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
                    <Text style={styles.label}>เลขใบขับขี่ *</Text>
                    <TextInput
                        style={styles.input}
                        value={licenseNumber}
                        onChangeText={setLicenseNumber}
                        placeholder="ระบุเลขใบขับขี่"
                        placeholderTextColor="#6A7A7A"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#001010" />
                    ) : (
                        <Text style={styles.submitButtonText}>บันทึกและส่งตรวจสอบ</Text>
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
    vehicleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    vehicleOption: {
        width: '48%',
        backgroundColor: '#02090A',
        borderWidth: 1,
        borderColor: '#1E3C33',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vehicleOptionSelected: {
        borderColor: '#36D873',
        backgroundColor: 'rgba(54, 216, 115, 0.1)',
    },
    vehicleLabel: {
        marginTop: 8,
        color: '#6A7A7A',
        fontSize: 14,
    },
    vehicleLabelSelected: {
        color: '#36D873',
        fontWeight: 'bold',
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
