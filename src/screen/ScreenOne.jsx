import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';

export function ScreenOne({ navigation }) {
    const stats = {
        totalProducts: 1234,
        totalCities: 8,
        outOfStock: 12,
        totalValue: "1,234,567",
        recentActivity: 45
    };

    const products = [
        { id: 1, name: 'Product A' },
        { id: 2, name: 'Product B' },
        { id: 3, name: 'Product C' },
        { id: 4, name: 'Product D' },
        { id: 5, name: 'Product E' },
        // أضف المزيد من المنتجات هنا
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(products);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
        setFilteredProducts(filtered);
    };

    const quickActions = [
        {
            title: "Scan Product",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126591.png",
            action: () => console.log("Scan")
        },
        {
            title: "Add Product",
            icon: "https://cdn-icons-png.flaticon.com/512/4315/4315609.png",
            action: () => console.log("Add")
        },
        {
            title: "Search",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126544.png",
            action: () => console.log("Search")
        },
        {
            title: "Export",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126613.png",
            action: () => console.log("Export")
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>John Doe</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.actionButton}
                                onPress={action.action}
                            >
                                <Image source={{ uri: action.icon }} style={styles.actionIcon} />
                                <Text style={styles.actionText}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Products..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                {/* Filtered Products */}
                <View style={styles.productsContainer}>
                    <Text style={styles.sectionTitle}>Products</Text>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <View key={product.id} style={styles.productCard}>
                                <Text style={styles.productName}>{product.name}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No products found</Text>
                    )}
                </View>

                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Dashboard Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
                            <Text style={styles.statLabel}>Total Products</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>{stats.totalCities}</Text>
                            <Text style={styles.statLabel}>Cities Covered</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation, styles.alertCard]}>
                            <Text style={[styles.statNumber, styles.alertText]}>{stats.outOfStock}</Text>
                            <Text style={styles.statLabel}>Out of Stock</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>${stats.totalValue}</Text>
                            <Text style={styles.statLabel}>Total Value</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.recentActivity}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={[styles.activityCard, styles.elevation]}>
                        <Text style={styles.activityText}>
                            {stats.recentActivity} products updated in the last 24 hours
                        </Text>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    greeting: {
        fontSize: 16,
        color: '#64748b'
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    content: {
        flex: 1,
        padding: 20
    },
    quickActionsContainer: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16
    },
    actionButton: {
        width: '47%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    actionIcon: {
        width: 32,
        height: 32,
        marginBottom: 8
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155'
    },
    searchContainer: {
        marginBottom: 24
    },
    searchInput: {
        height: 40,
        borderColor: '#e2e8f0',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 12,
        fontSize: 16,
        color: '#334155'
    },
    productsContainer: {
        marginBottom: 24
    },
    productCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 4
    },
    productName: {
        fontSize: 16,
        color: '#334155'
    },
    statsContainer: {
        marginBottom: 24
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between'
    },
    statCard: {
        width: '47%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
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
    alertCard: {
        backgroundColor: '#fef2f2'
    },
    alertText: {
        color: '#dc2626'
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
    recentActivity: {
        marginBottom: 24
    },
    activityCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12
    },
    activityText: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 12
    },
    viewAllButton: {
        backgroundColor: '#f1f5f9',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center'
    },
    viewAllText: {
        color: '#2563eb',
        fontWeight: '600'
    }
});
