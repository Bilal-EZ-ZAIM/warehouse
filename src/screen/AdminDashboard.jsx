import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';

export function AdminDashboard({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([
        {
            id: 1,
            name: "Laptop HP Pavilion",
            type: "Informatique",
            price: 1200,
            stocks: [
                { name: "Gueliz B2", quantity: 21 },
                { name: "Lazari H2", quantity: 24 }
            ]
        },
        {
            id: 2,
            name: "Clavier Mécanique Logitech",
            type: "Accessoires",
            price: 100,
            stocks: [
                { name: "Gueliz B2", quantity: 20 },
                { name: "Lazari H2", quantity: 5 }
            ]
        },
        {
            id: 3,
            name: "Pc Gamer Omen By HP",
            type: "Informatique",
            price: 11000,
            stocks: []
        }
    ]);

    const stats = {
        totalProducts: 3,
        totalCities: 2,
        outOfStock: 1,
        totalValue: calculateTotalValue(products),
        recentActivity: 2
    };

    const quickActions = [
        {
            title: "Scanner Code",
            icon: "https://cdn-icons-png.flaticon.com/512/3126/3126591.png",
            action: () => navigation.navigate('Scanner')
        },
        {
            title: "Nouveau Produit",
            icon: "https://cdn-icons-png.flaticon.com/512/4315/4315609.png",
            action: () => navigation.navigate('NewProduct')
        },
        {
            title: "Entrepôts",
            icon: "https://cdn-icons-png.flaticon.com/512/1668/1668488.png",
            action: () => navigation.navigate('Warehouses')
        },
        {
            title: "Statistiques",
            icon: "https://cdn-icons-png.flaticon.com/512/2936/2936690.png",
            action: () => navigation.navigate('Statistics')
        }
    ];

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    function calculateTotalValue(products) {
        return products.reduce((total, product) => {
            const stockQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            return total + (product.price * stockQuantity);
        }, 0);
    }

    const getStockStatus = (stocks) => {
        const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);
        if (totalQuantity === 0) return { status: 'Rupture', color: '#dc2626' };
        if (totalQuantity < 10) return { status: 'Stock Faible', color: '#eab308' };
        return { status: 'En Stock', color: '#22c55e' };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Tableau de bord</Text>
                    <Text style={styles.userName}>Admin Console</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Statistics Cards */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
                            <Text style={styles.statLabel}>Produits Total</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>{stats.totalCities}</Text>
                            <Text style={styles.statLabel}>Villes</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation, styles.alertCard]}>
                            <Text style={[styles.statNumber, styles.alertText]}>{stats.outOfStock}</Text>
                            <Text style={styles.statLabel}>Rupture Stock</Text>
                        </View>
                        <View style={[styles.statCard, styles.elevation]}>
                            <Text style={styles.statNumber}>{stats.totalValue.toLocaleString()} DH</Text>
                            <Text style={styles.statLabel}>Valeur Totale</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.sectionTitle}>Actions Rapides</Text>
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
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                {/* Products List */}
                <View style={styles.productsContainer}>
                    <Text style={styles.sectionTitle}>Produits Récents</Text>
                    {products.map(product => {
                        const stockStatus = getStockStatus(product.stocks);
                        return (
                            <TouchableOpacity 
                                key={product.id} 
                                style={styles.productCard}
                                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                            >
                                <View style={styles.productHeader}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={[styles.stockStatus, { color: stockStatus.color }]}>
                                        {stockStatus.status}
                                    </Text>
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={styles.productType}>{product.type}</Text>
                                    <Text style={styles.productPrice}>{product.price.toLocaleString()} DH</Text>
                                </View>
                                {product.stocks.map((stock, index) => (
                                    <Text key={index} style={styles.stockInfo}>
                                        {stock.name}: {stock.quantity} unités
                                    </Text>
                                ))}
                            </TouchableOpacity>
                        );
                    })}
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
        backgroundColor: 'white',
        height: 48,
        borderColor: '#e2e8f0',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        flex: 1
    },
    stockStatus: {
        fontSize: 14,
        fontWeight: '500'
    },
    productInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    productType: {
        fontSize: 14,
        color: '#64748b'
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155'
    },
    stockInfo: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4
    },
    elevation: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
    }
});