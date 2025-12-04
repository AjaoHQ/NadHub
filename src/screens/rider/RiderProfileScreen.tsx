import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { RiderRatingSummary } from "../../components/RiderRatingSummary";
import { useAuth } from "../../store/auth";

export default function RiderProfileScreen() {
    const navigation = useNavigation();
    const { user, logout, refreshUser } = useAuth();

    useFocusEffect(
        React.useCallback(() => {
            refreshUser();
        }, [])
    );

    const initials = useMemo(() => {
        const name = user?.riderName || user?.displayName;
        if (!name) return "R";
        const parts = name.trim().split(" ");
        const first = parts[0]?.[0] ?? "";
        const second = parts[1]?.[0] ?? "";
        return (first + second).toUpperCase();
    }, [user?.riderName, user?.displayName]);

    const handleEditProfile = () => {
        navigation.navigate("RiderEditProfile" as never);
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
                {user?.riderImage ? (
                    <Image source={{ uri: user.riderImage }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                )}
                <View style={styles.headerText}>
                    <Text style={styles.name}>{user?.riderName || user?.displayName || "ไรเดอร์ NadHub"}</Text>
                    <Text style={styles.phone}>{user?.phone}</Text>
                </View>
            </View>

            {/* Rating Summary */}
            <RiderRatingSummary
                averageRating={4.8} // Placeholder for now
                totalReviews={32} // Placeholder for now
                totalCompletedJobs={120} // Placeholder for now
            />

            {/* Vehicle Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ข้อมูลพาหนะ</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>ประเภทรถ</Text>
                    <Text style={styles.value}>
                        {(user as any)?.vehicleType ?? "ยังไม่ได้ระบุ"}
                    </Text>

                    <Text style={[styles.label, { marginTop: 6 }]}>ทะเบียนรถ</Text>
                    <Text style={styles.value}>
                        {(user as any)?.plateNumber ?? "ยังไม่ได้ระบุ"}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
                <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('RiderReviews' as never)}>
                    <Text style={styles.primaryButtonText}>ดูรีวิวทั้งหมด</Text>
                </Pressable>

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
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: "#1E3C33",
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
    },
    value: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 2,
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
