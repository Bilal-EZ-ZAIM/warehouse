import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    TextInput,
    FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

export function HomeScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const categories = ['Tous', 'Informatique', 'Accessoires', 'Gaming', 'Réseau'];

    const products = [
        {
            id: 1,
            name: 'Laptop HP Pavilion',
            type: 'Informatique',
            price: '12000',
            priceNum: 12000,
            image: 'https://mediazone.ma/uploads/images/products/16412/landing-page/assets/images/swiper-1.png',
            stock: 21,
            status: 'En stock',
            supplier: 'HP Maroc'
        },
        {
            id: 2,
            name: 'PC Gamer Omen',
            type: 'Gaming',
            price: '11000',
            priceNum: 11000,
            image: 'https://technoplace.ma/11482-large_default/hp-omen-17-i7-7700hq-173-16gb-2tb-geforce-gtx-10.jpg',
            stock: 0,
            status: 'Rupture de stock',
            supplier: 'HP Maroc'
        },
        {
            id: 3,
            name: 'Clavier Mécanique',
            type: 'Accessoires',
            price: '1200',
            priceNum: 1200,
            image: 'https://in-media.apjonlinecdn.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/8/a/8aa01aa.png',
            stock: 5,
            status: 'Faible stock',
            supplier: 'Gaming Zone'
        }
    ];

    // البحث المحسن
    const searchProduct = (product) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.type.toLowerCase().includes(searchLower) ||
            product.price.toString().includes(searchLower) ||
            product.supplier.toLowerCase().includes(searchLower)
        );
    };

    // وظيفة الفرز
    const sortProducts = (a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'price':
                comparison = a.priceNum - b.priceNum;
                break;
            case 'stock':
                comparison = a.stock - b.stock;
                break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    };

    // تصفية وفرز المنتجات
    const filteredProducts = products
        .filter(product => 
            (activeCategory === 'Tous' || product.type === activeCategory) &&
            searchProduct(product)
        )
        .sort(sortProducts);

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
        >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price} DH</Text>
                <Text style={[
                    styles.productStock,
                    item.status === 'Rupture de stock' && styles.stockOut,
                    item.status === 'Faible stock' && styles.lowStock
                ]}>
                    {item.status} ({item.stock} unités)
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4f46e5', '#3b82f6']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Bonjour 👋</Text>
                        <Text style={styles.userName}>Magasinier</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                                style={styles.avatar}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un produit..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesList}
                    >
                        {categories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.categoryButton,
                                    activeCategory === category && styles.categoryButtonActive
                                ]}
                                onPress={() => setActiveCategory(category)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    activeCategory === category && styles.categoryButtonTextActive
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* أزرار الفرز */}
                <View style={styles.sortingRow}>
                    <TouchableOpacity 
                        style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
                        onPress={() => {
                            if (sortBy === 'name') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                                setSortBy('name');
                                setSortOrder('asc');
                            }
                        }}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
                            Nom {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.sortButton, sortBy === 'price' && styles.activeSortButton]}
                        onPress={() => {
                            if (sortBy === 'price') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                                setSortBy('price');
                                setSortOrder('asc');
                            }
                        }}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'price' && styles.activeSortButtonText]}>
                            Prix {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.sortButton, sortBy === 'stock' && styles.activeSortButton]}
                        onPress={() => {
                            if (sortBy === 'stock') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                                setSortBy('stock');
                                setSortOrder('asc');
                            }
                        }}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'stock' && styles.activeSortButtonText]}>
                            Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.productList}
                    />
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <LinearGradient
                    colors={['#4f46e5', '#3b82f6']}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // الأنماط الأصلية
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#e0e7ff',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    categoriesList: {
        flexDirection: 'row',
    },
    categoryButton: {
        backgroundColor: '#e5e7eb',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    categoryButtonActive: {
        backgroundColor: '#4f46e5',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#1e293b',
    },
    categoryButtonTextActive: {
        color: '#ffffff',
    },
    // أنماط الفرز الجديدة
    sortingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    sortButton: {
        backgroundColor: '#e5e7eb',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        minWidth: width / 4,
        alignItems: 'center',
    },
    activeSortButton: {
        backgroundColor: '#4f46e5',
    },
    sortButtonText: {
        fontSize: 14,
        color: '#1e293b',
    },
    activeSortButtonText: {
        color: '#ffffff',
    },
    // أنماط المنتجات
    productList: {
        paddingBottom: 20,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    productPrice: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 5,
    },
    productStock: {
        fontSize: 14,
        color: '#16a34a',
    },
    stockOut: {
        color: '#dc2626',
    },
    lowStock: {
        color: '#d97706',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
    },
    fabGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 28,
    },
    fabIcon: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
    }
});

export default HomeScreen;