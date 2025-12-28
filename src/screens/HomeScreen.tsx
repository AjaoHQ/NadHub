import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useOrders } from "../store/orders";
import { useAuth } from "../store/auth";
import { getOrderStatusLabel } from "../utils/orderStatus";

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { orders } = useOrders();
    const { user } = useAuth();

    const myOrders = orders.filter(o => o.buyerId === user?.id);

    const recentOrders = useMemo(
        () =>
            [...myOrders]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .slice(0, 5),
        [myOrders]
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            {/* Logo Header */}
            {/* Logo Header Removed (Duplicate) */}

            {/* Quick Actions */}
            <View style={styles.quickContainer}>
                <QuickBox
                    label="ตลาดใกล้คุณ"
                    onPress={() =>
                        navigation.navigate("Market" as any)
                    }
                />
                <QuickBox
                    label="สั่งอะไรด่วน"
                    onPress={() =>
                        navigation.navigate("BuyerTabs", { screen: "BuyerOrders" } as any)
                    }
                />
                <QuickBox
                    label="รายการล่าสุด"
                    onPress={() =>
                        navigation.navigate("BuyerTabs", { screen: "BuyerOrders" } as any)
                    }
                />
            </View>

            {/* Recent Orders */}
            <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
            {recentOrders.length === 0 ? (
                <Text style={styles.noOrders}>ยังไม่มีรายการสั่งซื้อ</Text>
            ) : (
                <View style={styles.orderList}>
                    {recentOrders.map((o) => (
                        <TouchableOpacity
                            key={o.id}
                            style={styles.orderCard}
                            onPress={() =>
                                navigation.navigate(
                                    "BuyerOrderDetail" as any,
                                    { orderId: o.id } as any
                                )
                            }
                        >
                            <Text style={styles.orderTitle}>#{o.id.slice(-6)}</Text>
                            <Text style={styles.orderStatus}>{getOrderStatusLabel(o.status)}</Text>
                            <Text style={styles.orderTime}>{new Date(o.createdAt).toLocaleString("th-TH")}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

function QuickBox({
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.quickBox} onPress={onPress}>
            <Text style={styles.quickText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000608",
    },
    content: {
        padding: 16,
    },
    quickContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 16,
    },
    quickBox: {
        flex: 1,
        backgroundColor: "#001010",
        borderWidth: 1,
        borderColor: "#1E3C33",
        paddingVertical: 18,
        marginHorizontal: 6,
        borderRadius: 14,
    },
    quickText: {
        textAlign: "center",
        color: "#36D873",
        fontWeight: "700",
        fontSize: 14,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 10,
    },
    noOrders: {
        color: "#7B8A8A",
        fontSize: 14,
        paddingVertical: 16,
    },
    orderList: {
        gap: 12,
    },
    orderCard: {
        backgroundColor: "#02090A",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1E3C33",
    },
    orderTitle: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    orderStatus: {
        color: "#36D873",
        fontSize: 14,
        marginTop: 2,
    },
    orderTime: {
        color: "#7F8E8E",
        fontSize: 12,
        marginTop: 4,
    },
});
