import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RiderStackParamList } from '../../types';
import { useOrders, Order } from '../../store/orders';
import { useProducts } from '../../store/products';
import { RiderRatingSummary } from '../../components/RiderRatingSummary';
import { useAuth } from '../../store/auth';

type NavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RiderHome'>;

const CURRENT_RIDER = "Demo Rider";

type TabType = 'available' | 'my_jobs';

export default function RiderHomeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { getAvailableForRider, getOrdersByRider, assignRider } = useOrders();
    const { products } = useProducts();
    const [activeTab, setActiveTab] = useState<TabType>('available');

    const { user: riderProfile } = useAuth();

    // Check for rider profile completeness
    React.useEffect(() => {
        if (riderProfile?.role === 'rider') {
            const p = riderProfile as any;
            // Only redirect if profile is explicitly NOT complete
            if (p.isRiderProfileComplete === false) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'RiderSignup' as any }],
                });
            }
        }
    }, [riderProfile]);

    // Filter available orders: confirmed (new) or WAITING_RIDER (legacy)
    const availableOrders = getAvailableForRider().filter(o =>
        o.status === 'confirmed' || o.status === 'WAITING_RIDER'
    );

    // Filter for active jobs
    const myJobs = getOrdersByRider(CURRENT_RIDER).filter(o =>
        [
            'assigned', 'picked_up', 'delivered', // New statuses
            'RIDER_HEADING_TO_STORE', 'PICKED_UP', 'RIDER_ARRIVED', 'DELIVERED_WAITING_PAYMENT' // Legacy
        ].includes(o.status)
    );

    // Calculate Stats
    const allMyOrders = getOrdersByRider(CURRENT_RIDER);
    const stats = useMemo(() => {
        const completedOrders = allMyOrders.filter(o => o.status === 'COMPLETED');
        const totalCompletedJobs = completedOrders.length;

        // Use riderRating for stats
        const ratedOrders = completedOrders.filter(o => o.riderRating && o.riderRating > 0);
        const totalReviews = ratedOrders.length;

        let averageRating = 0;
        if (totalReviews > 0) {
            const sum = ratedOrders.reduce((acc, o) => acc + (o.riderRating || 0), 0);
            averageRating = sum / totalReviews;
        }

        return {
            averageRating,
            totalReviews,
            totalCompletedJobs
        };
    }, [allMyOrders]);

    const displayedOrders = activeTab === 'available' ? availableOrders : myJobs;

    const getProductName = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'สินค้าไม่ทราบชื่อ';
    };

    const handleAcceptJob = (orderId: string) => {
        assignRider(orderId, {
            id: 'rider_1', // Mock rider ID
            name: CURRENT_RIDER,
            phone: '0812345678'
        });
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RiderOrderDetail', { orderId: item.id })}
        >
            <View style={styles.header}>
                <Text style={styles.orderId}>Order #{item.id.slice(-4)}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('th-TH')}</Text>
            </View>

            <Text style={styles.productName}>{getProductName(item.productId)}</Text>
            <Text style={styles.location}>📍 รับที่: {item.storeName}</Text>
            <Text style={styles.buyerInfo}>📦 ส่งถึง: {item.customerAddress}</Text>
            <Text style={styles.fee}>💰 ค่าส่ง: {item.deliveryFee} บาท</Text>

            <View style={styles.actionRow}>
                <Text style={[styles.statusTag, activeTab === 'my_jobs' ? styles.statusDelivering : styles.statusPending]}>
                    {activeTab === 'available' ? 'รอรับงาน' : 'กำลังจัดส่ง'}
                </Text>

                {activeTab === 'available' ? (
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptJob(item.id)}
                    >
                        <Text style={styles.acceptButtonText}>รับงาน</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.viewDetail}>ดูรายละเอียด {'>'}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    // Verification Status Check
    return (
        <View style={styles.container}>
            {/* Main Content - Always shown as riders are auto-approved */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>งานไรเดอร์</Text>
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('RiderTabs', { screen: 'RiderHistory' } as never)}
                >
                    <Text style={styles.historyButtonText}>ประวัติงาน</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dashboardContainer}>
                <Text style={styles.riderName}>{CURRENT_RIDER}</Text>
                <RiderRatingSummary
                    averageRating={stats.averageRating}
                    totalReviews={stats.totalReviews}
                    totalCompletedJobs={stats.totalCompletedJobs}
                />
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'available' && styles.activeTab]}
                    onPress={() => setActiveTab('available')}
                >
                    <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
                        งานที่รอรับ ({availableOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'my_jobs' && styles.activeTab]}
                    onPress={() => setActiveTab('my_jobs')}
                >
                    <Text style={[styles.tabText, activeTab === 'my_jobs' && styles.activeTabText]}>
                        งานของฉัน ({myJobs.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayedOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'available' ? 'ไม่มีงานที่รอรับในขณะนี้' : 'คุณยังไม่มีงานที่กำลังจัดส่ง'}
                        </Text>
                    </View>
                }
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000608',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#000A0A',
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    historyButton: {
        backgroundColor: '#36D873',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    historyButtonText: {
        color: '#001010',
        fontSize: 12,
        fontWeight: '600',
    },
    dashboardContainer: {
        padding: 16,
        backgroundColor: '#02090A',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1E3C33',
    },
    riderName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#FFFFFF',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#000A0A',
        padding: 8,
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#1E3C33',
    },
    tabText: {
        fontSize: 14,
        color: '#6A7A7A',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#36D873',
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#02090A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1E3C33',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderId: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    date: {
        fontSize: 12,
        color: '#6A7A7A',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#FFFFFF',
    },
    buyerInfo: {
        fontSize: 14,
        color: '#B0B0B0',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: '#36D873',
        marginBottom: 4,
    },
    fee: {
        fontSize: 14,
        color: '#36D873',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusTag: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    statusPending: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    statusDelivering: {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
    },
    viewDetail: {
        color: '#36D873',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#6A7A7A',
    },
    acceptButton: {
        backgroundColor: '#36D873',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    acceptButtonText: {
        color: '#001010',
        fontWeight: 'bold',
        fontSize: 14,
    },
    banner: {
        backgroundColor: '#FF9500',
        padding: 12,
        alignItems: 'center',
    },
    bannerText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    infoText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subInfoText: {
        color: '#6A7A7A',
        fontSize: 14,
        textAlign: 'center',
    },
    editButton: {
        marginTop: 20,
        backgroundColor: '#36D873',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    editButtonText: {
        color: '#001010',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
