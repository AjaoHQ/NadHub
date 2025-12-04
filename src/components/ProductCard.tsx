import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    imageUris?: string[]; // Support both for compatibility
    isHot?: boolean;
    category?: string;
    description?: string;
    merchantId?: string;
};

type Props = {
    product: Product;
    merchantName: string;
    isStoreOpen: boolean;
    onPress: () => void;
};

export function ProductCard({ product, merchantName, isStoreOpen, onPress }: Props) {
    // Internal state removed, using props instead

    // Handle both imageUrl and imageUris
    const imageSource = product.imageUrl
        ? { uri: product.imageUrl }
        : (product.imageUris && product.imageUris.length > 0
            ? { uri: product.imageUris[0] }
            : null);

    return (
        <TouchableOpacity
            style={[styles.card, !isStoreOpen && styles.cardClosed]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrapper}>
                {imageSource ? (
                    <Image source={imageSource} style={[styles.image, !isStoreOpen && styles.imageClosed]} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>NadHub</Text>
                    </View>
                )}
                {product.isHot && isStoreOpen && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>HOT</Text>
                    </View>
                )}
                {!isStoreOpen && (
                    <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>ปิดชั่วคราว</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.name, !isStoreOpen && styles.textClosed]} numberOfLines={2}>
                {product.name}
            </Text>

            <Text style={[styles.price, !isStoreOpen && styles.textClosed]}>
                ฿ {product.price.toLocaleString("th-TH")}
            </Text>

            <Text style={styles.merchantName}>{merchantName}</Text>
            <Text
                style={[
                    styles.storeStatus,
                    isStoreOpen ? styles.storeOpen : styles.storeClosed,
                ]}
            >
                {isStoreOpen ? "ร้านเปิดอยู่" : "ร้านปิดชั่วคราว"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#02090A",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#1E3C33",
        padding: 10,
        margin: 6,
    },
    imageWrapper: {
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#001010",
        marginBottom: 8,
    },
    image: {
        width: "100%",
        height: 110,
    },
    placeholder: {
        width: "100%",
        height: 110,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderText: {
        color: "#36D873",
        fontWeight: "700",
        fontSize: 16,
    },
    badge: {
        position: "absolute",
        top: 6,
        left: 6,
        backgroundColor: "#36D873",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        color: "#001010",
        fontSize: 10,
        fontWeight: "700",
    },
    name: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        minHeight: 34,
    },
    price: {
        color: "#36D873",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 4,
    },
    cardClosed: {
        opacity: 0.7,
    },
    imageClosed: {
        opacity: 0.6,
    },
    textClosed: {
        color: "#8E8E93",
    },
    closedBadge: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    closedBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        backgroundColor: "#8E8E93",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: "hidden",
    },
    merchantName: {
        fontSize: 12,
        color: "#7B8A8A",
        marginTop: 4,
    },
    storeStatus: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: "600",
    },
    storeOpen: {
        color: "#36D873",
    },
    storeClosed: {
        color: "#FF3B30",
    },
});
