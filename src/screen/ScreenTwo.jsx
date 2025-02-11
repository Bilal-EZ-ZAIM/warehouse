import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';

export function ScreenTwo({ navigation }) {
    const stats = {
        totalProducts: 1234,
        totalCities: 8,
        outOfStock: 12,
        totalValue: "1,234,567",
        recentActivity: 45,
        lowStock: 23
    };

    const quickActions = [
        {
            title: "Scan Product",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126591.png",
            description: "Scan barcode to manage inventory",
            action: () => console.log("Scan")
        },
        {
            title: "Add Product",
            icon: "https://cdn-icons-png.flaticon.com/512/4315/4315609.png",
            description: "Add new product manually",
            action: () => console.log("Add")
        },
        {
            title: "Search",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126544.png",
            description: "Find products in inventory",
            action: () => console.log("Search")
        },
        {
            title: "Export",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126613.png",
            description: "Generate inventory reports",
            action: () => console.log("Export")
        }
    ];

    const recentUpdates = [
        { id: 1, action: "Added", product: "Laptop Dell XPS", quantity: 50 },
        { id: 2, action: "Updated", product: "iPhone 13 Pro", quantity: 25 },
        { id: 3, action: "Removed", product: "Samsung TV", quantity: 10 }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>John Doe</Text>
                    <Text style={styles.role}>Inventory Manager</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png' }}
                            style={styles.notificationIcon}
                        />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>3</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Image 
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Stats Row */}
                <View style={styles.quickStats}>
                    <View style={[styles.quickStatCard, styles.elevation]}>
                        <View style={styles.quickStatIconContainer}>
                            <Image 
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' }}
                                style={styles.quickStatIcon}
                            />
                        </View>
                        <Text style={styles.quickStatValue}>{stats.outOfStock}</Text>
                        <Text style={styles.quickStatLabel}>Out of Stock</Text>
                    </View>
                    <View style={[styles.quickStatCard, styles.elevation]}>
                        <View style={[styles.quickStatIconContainer, { backgroundColor: '#fff7ed' }]}>
                            <Image 
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1041/1041373.png' }}
                                style={styles.quickStatIcon}
                            />
                        </View>
                        <Text style={styles.quickStatValue}>{stats.lowStock}</Text>
                        <Text style={styles.quickStatLabel}>Low Stock</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllButton}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.quickActions}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.actionButton, styles.elevation]}
                                onPress={action.action}
                            >
                                <View style={styles.actionIconContainer}>
                                    <Image source={{ uri: action.icon }} style={styles.actionIcon} />
                                </View>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionDescription}>{action.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <TouchableOpacity style={styles.periodSelector}>
                            <Text style={styles.periodText}>This Month</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.elevation]}>
                            <View style={styles.statHeader}>
                                <Image 
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png' }}
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statTrend}>+12.5%</Text>
                            </View>
                            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
                            <Text style={styles.statLabel}>Total Products</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <View style={styles.statHeader}>
                                <Image 
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/535/535239.png' }}
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statTrend}>+3.2%</Text>
                            </View>
                            <Text style={styles.statNumber}>{stats.totalCities}</Text>
                            <Text style={styles.statLabel}>Cities Covered</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <View style={styles.statHeader}>
                                <Image 
                                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2454/2454282.png' }}
                                    style={styles.statIcon}
                                />
                                <Text style={styles.statTrend}>+8.7%</Text>
                            </View>
                            <Text style={styles.statNumber}>${stats.totalValue}</Text>
                            <Text style={styles.statLabel}>Total Value</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.recentActivity}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Updates</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllButton}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.activityCard, styles.elevation]}>
                        {recentUpdates.map((update, index) => (
                            <View key={update.id} style={[
                                styles.activityItem,
                                index < recentUpdates.length - 1 && styles.activityItemBorder
                            ]}>
                                <View style={styles.activityIconContainer}>
                                    <Image 
                                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2921/2921222.png' }}
                                        style={styles.activityIcon}
                                    />
                                </View>
                                <View style={styles.activityDetails}>
                                    <Text style={styles.activityProduct}>{update.product}</Text>
                                    <Text style={styles.activityAction}>
                                        {update.action} • {update.quantity} units
                                    </Text>
                                </View>
                                <Text style={styles.activityTime}>2h ago</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    headerLeft: {
        flex: 1
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    greeting: {
        fontSize: 14,
        color: '#64748b'
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    role: {
        fontSize: 14,
        color: '#2563eb',
        marginTop: 4
    },
    notificationButton: {
        position: 'relative',
        padding: 8
    },
    notificationIcon: {
        width: 24,
        height: 24
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    notificationCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0'
    },
    content: {
        flex: 1,
        padding: 20
    },
    quickStats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24
    },
    quickStatCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center'
    },
    quickStatIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    quickStatIcon: {
        width: 24,
        height: 24
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    quickStatLabel: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    seeAllButton: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '600'
    },
    quickActionsContainer: {
        marginBottom: 24
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16
    },
    actionButton: {
        width: '47%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start'
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    actionIcon: {
        width: 24,
        height: 24
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4
    },
    actionDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16
    },
    statsContainer: {
        marginBottom: 24
    },
    periodSelector: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    periodText: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: '500'
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16
    },
    statCard: {
        width: '47%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    statIcon: {
        width: 24,
        height: 24
    },
    statTrend: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: '600'
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b'
    },
    elevation: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4
    },
    recentActivity: {
        marginBottom: 24
    },
    activityCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden'
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12
    },
    activityItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activityIcon: {
        width: 20,
        height: 20
    },
    activityDetails: {
        flex: 1
    },
    activityProduct: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4
    },
    activityAction: {
        fontSize: 14,
        color: '#64748b'
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8'
    }
});