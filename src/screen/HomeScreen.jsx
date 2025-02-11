import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  FlatList,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUsername] = useState("");

  const categories = [
    "Tous",
    "Informatique",
    "Accessoires",
    "Gaming",
    "Réseau",
  ];

  const products = [
    {
      id: 1,
      name: "Laptop HP Pavilion",
      type: "Informatique",
      price: "12000",
      priceNum: 12000,
      image:
        "https://mediazone.ma/uploads/images/products/16412/landing-page/assets/images/swiper-1.png",
      stock: 21,
      status: "En stock",
      supplier: "HP Maroc",
    },
    {
      id: 2,
      name: "PC Gamer Omen",
      type: "Gaming",
      price: "11000",
      priceNum: 11000,
      image:
        "https://technoplace.ma/11482-large_default/hp-omen-17-i7-7700hq-173-16gb-2tb-geforce-gtx-10.jpg",
      stock: 0,
      status: "Rupture de stock",
      supplier: "HP Maroc",
    },
    {
      id: 3,
      name: "Clavier Mécanique",
      type: "Accessoires",
      price: "1200",
      priceNum: 1200,
      image:
        "https://in-media.apjonlinecdn.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/8/a/8aa01aa.png",
      stock: 5,
      status: "Faible stock",
      supplier: "Gaming Zone",
    },
  ];

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const secretKey = await AsyncStorage.getItem("secretKey");
      const username = await AsyncStorage.getItem("name");
      setUsername(username || "Utilisateur");
      setIsAdmin(secretKey === "AH90907J");
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["secretKey", "name"]);
      navigation.replace("Login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const searchProduct = (product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.type.toLowerCase().includes(searchLower) ||
      product.price.toString().includes(searchLower) ||
      product.supplier.toLowerCase().includes(searchLower)
    );
  };

  const sortProducts = (a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = a.priceNum - b.priceNum;
        break;
      case "stock":
        comparison = a.stock - b.stock;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  };

  const filteredProducts = products
    .filter(
      (product) =>
        (activeCategory === "Tous" || product.type === activeCategory) &&
        searchProduct(product)
    )
    .sort(sortProducts);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetail", { id: item.id })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productType}>{item.type}</Text>
        <Text style={styles.productPrice}>{item.price} DH</Text>
        <Text
          style={[
            styles.productStock,
            item.status === "Rupture de stock" && styles.stockOut,
            item.status === "Faible stock" && styles.lowStock,
          ]}
        >
          {item.status} ({item.stock} unités)
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
      <LinearGradient colors={["#4f46e5", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerActions}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate("AdminScreen")}
              >
                <Text style={styles.adminButtonText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    activeCategory === category && styles.categoryButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sortingContainer}>
          {["name", "price", "stock"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortButton,
                sortBy === option && styles.activeSortButton,
              ]}
              onPress={() => {
                if (sortBy === option) {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(option);
                  setSortOrder("asc");
                }
              }}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === option && styles.activeSortButtonText,
                ]}
              >
                {option === "name"
                  ? "Nom"
                  : option === "price"
                  ? "Prix"
                  : "Stock"}{" "}
                {sortBy === option && (sortOrder === "asc" ? "↑" : "↓")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.productsContainer}>
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddProduct")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#e0e7ff",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adminButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  adminButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 10,
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: "#4f46e5",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#ffffff",
  },
  sortingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sortButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeSortButton: {
    backgroundColor: "#4f46e5",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  activeSortButtonText: {
    color: "#ffffff",
  },
  productsContainer: {
    flex: 1,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: (width - 50) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  stockOut: {
    color: "#ef4444",
  },
  lowStock: {
    color: "#f59e0b",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default HomeScreen;