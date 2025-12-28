import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ProductCard } from "../components/ProductCard";
import { useProducts, Product } from "../store/products";
import { PRODUCT_CATEGORIES, ProductCategoryId } from "../constants/categories";

export default function MarketScreen() {
    const navigation = useNavigation<any>();
    const { products, isLoading } = useProducts();
    const [search, setSearch] = useState("");

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={{ color: '#fff' }}>กำลังโหลดสินค้า...</Text>
            </View>
        );
    }
    const [selectedCategoryId, setSelectedCategoryId] = useState<ProductCategoryId | "all">("all");

    const filtered = useMemo(() => {
        let list: Product[] = products ?? [];

        if (selectedCategoryId !== "all") {
            list = list.filter((p) => p.categoryId === selectedCategoryId);
        }

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.merchantName && p.merchantName.toLowerCase().includes(q))
            );
        }

        return list;
    }, [products, selectedCategoryId, search]);

    const renderProduct = ({ item }: { item: Product }) => {
        // Assume store is open if not specified, or handle isOpen from product/merchant data if available in future
        // For now, removing the dependency on merchantStatus check
        const isStoreOpen = true;
        const merchantName = item.merchantName || "ไม่ทราบชื่อร้าน";

        return (
            <ProductCard
                product={item}
                merchantName={merchantName}
                isStoreOpen={isStoreOpen}
                onPress={() =>
                    navigation.navigate(
                        "ProductDetail" as any,
                        { productId: item.id } as any
                    )
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>ตลาด NadHub</Text>
                <Text style={styles.subTitle}>ของกิน ของใช้ ใกล้บ้านคุณ</Text>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
                <TextInput
                    placeholder="ค้นหาสินค้าที่ต้องการ..."
                    placeholderTextColor="#5C6A6A"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Categories */}
            <View style={styles.categoryRow}>
                <FlatList
                    data={[{ id: "all", label: "ทั้งหมด" }, ...PRODUCT_CATEGORIES]}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                item.id === selectedCategoryId && styles.chipActive,
                            ]}
                            onPress={() => setSelectedCategoryId(item.id as ProductCategoryId | "all")}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    item.id === selectedCategoryId && styles.chipTextActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Product Grid */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
                renderItem={renderProduct}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>ยังไม่มีสินค้าตามเงื่อนไขที่เลือก</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000608",
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 8,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
    },
    subTitle: {
        color: "#7B8A8A",
        fontSize: 12,
        marginTop: 2,
    },
    searchBox: {
        marginTop: 10,
        marginBottom: 8,
    },
    searchInput: {
        backgroundColor: "#02090A",
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#1E3C33",
        color: "#FFFFFF",
        fontSize: 14,
    },
    categoryRow: {
        marginBottom: 6,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#1E3C33",
        marginRight: 8,
        backgroundColor: "#000608",
    },
    chipActive: {
        backgroundColor: "#36D873",
        borderColor: "#36D873",
    },
    chipText: {
        color: "#7B8A8A",
        fontSize: 12,
        fontWeight: "600",
    },
    chipTextActive: {
        color: "#001010",
    },
    gridContent: {
        paddingTop: 6,
        paddingBottom: 16,
    },
    emptyText: {
        color: "#7B8A8A",
        fontSize: 13,
        textAlign: "center",
        marginTop: 40,
    },
});
