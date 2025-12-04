import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RiderRatingSummaryProps = {
    averageRating: number;
    totalReviews: number;
    totalCompletedJobs: number;
};

export function RiderRatingSummary(props: RiderRatingSummaryProps) {
    const { averageRating, totalReviews, totalCompletedJobs } = props;

    const displayRating =
        Number.isFinite(averageRating) && averageRating > 0
            ? averageRating.toFixed(1)
            : "-";

    return (
        <View style={styles.card}>
            <View style={styles.left}>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={26} color="#36D873" />
                    <Text style={styles.ratingText}>{displayRating}</Text>
                </View>
                <Text style={styles.label}>คะแนนเฉลี่ยจากลูกค้า</Text>
            </View>

            <View style={styles.right}>
                <View style={styles.statRow}>
                    <Text style={styles.statValue}>{totalReviews}</Text>
                    <Text style={styles.statLabel}>รีวิวทั้งหมด</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.statValue}>{totalCompletedJobs}</Text>
                    <Text style={styles.statLabel}>งานที่เสร็จแล้ว</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#02090A",
        borderWidth: 1,
        borderColor: "#1E3C33",
        marginBottom: 12,
    },
    left: {
        flexDirection: "column",
        gap: 4,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    ratingText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    label: {
        color: "#8FA3A3",
        fontSize: 12,
    },
    right: {
        alignItems: "flex-end",
        gap: 6,
    },
    statRow: {
        alignItems: "flex-end",
    },
    statValue: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    statLabel: {
        color: "#8FA3A3",
        fontSize: 12,
    },
});
