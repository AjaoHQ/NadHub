import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/auth";

type BuyerProfile = {
    name: string;
    phone: string;
    addressLine?: string | null;
};

export default function BuyerProfileScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    // Determine the display address: use default address if available, otherwise fallback to addressLine or placeholder
    const displayAddress = useMemo(() => {
        if (user?.addresses && user.addresses.length > 0) {
            const defaultAddress = user.addresses.find(a => a.isDefault);
            if (defaultAddress) return defaultAddress.fullAddress;
            return user.addresses[0].fullAddress;
        }
        return user?.addressLine || "ยังไม่ได้ตั้งค่าที่อยู่เริ่มต้น";
    }, [user]);

    const profile: BuyerProfile = {
        name: user?.buyerName || user?.displayName || "ผู้ใช้ NadHub",
        phone: user?.phone ?? "",
        addressLine: displayAddress,
    };

    const initials = useMemo(() => {
        if (!profile.name) return "N";
        const parts = profile.name.trim().split(" ");
        const first = parts[0]?.[0] ?? "";
        const second = parts[1]?.[0] ?? "";
        return (first + second).toUpperCase();
    }, [profile.name]);

    const handleEditProfile = () => {
        navigation.navigate("BuyerEditProfile" as never);
    };

    const handleManageAddress = () => {
        navigation.navigate("AddressList" as never);
    };

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'RoleSelector' as never }],
        });
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Avatar + Name */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {user?.buyerImage ? (
                        <Image source={{ uri: user.buyerImage }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{initials}</Text>
                    )}
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.phone}>{profile.phone}</Text>
                </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ข้อมูลติดต่อ</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                    <Text style={styles.value}>{profile.phone}</Text>
                </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ที่อยู่จัดส่งหลัก</Text>
                <View style={styles.card}>
                    <Text style={styles.value}>
                        {profile.addressLine}
                    </Text>
                </View>
                <Pressable style={styles.secondaryButton} onPress={handleManageAddress}>
                    <Text style={styles.secondaryButtonText}>จัดการที่อยู่</Text>
                </Pressable>
            </View>

            {/* Actions */}
            <View style={styles.section}>
                <Pressable style={styles.primaryButton} onPress={handleEditProfile}>
                    <Text style={styles.primaryButtonText}>แก้ไขโปรไฟล์</Text>
                </Pressable>

                <Pressable style={styles.dangerButton} onPress={handleLogout}>
                    <Text style={styles.dangerButtonText}>ออกจากระบบ</Text>
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#02090A",
        borderWidth: 1,
        borderColor: "#1E3C33",
        alignItems: "center",
        justifyContent: "center",
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: "#36D873",
        fontSize: 24,
        fontWeight: "800",
    },
    headerText: {
        flexDirection: "column",
        gap: 4,
    },
    name: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    phone: {
        color: "#8FA3A3",
        fontSize: 13,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#02090A",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#1E3C33",
    },
    label: {
        color: "#8FA3A3",
        fontSize: 12,
        marginBottom: 2,
    },
    value: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: "#36D873",
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: "center",
    },
    primaryButtonText: {
        color: "#001010",
        fontSize: 14,
        fontWeight: "700",
    },
    secondaryButton: {
        backgroundColor: "transparent",
        borderRadius: 999,
        paddingVertical: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#36D873",
        marginTop: 4,
    },
    secondaryButtonText: {
        color: "#36D873",
        fontSize: 14,
        fontWeight: "700",
    },
    dangerButton: {
        marginTop: 8,
        backgroundColor: "#221014",
        borderRadius: 999,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#FF5C5C",
        alignItems: "center",
    },
    dangerButtonText: {
        color: "#FF8383",
        fontSize: 14,
        fontWeight: "700",
    },
});
