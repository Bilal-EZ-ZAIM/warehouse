import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get("window");

export function AdminDashboard({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState("Admin");

  const getData = async () => {
    try {
      const secretKey = await AsyncStorage.getItem("secretKey");
      const name = await AsyncStorage.getItem("name");
      setUserName(name || "Admin");
      const response = await fetch("http://172.16.10.159:3000/products");
      const data = await response.json();
      const filteredData = data.filter(
        (item) => item.editedBy[0]?.warehousemanId == secretKey
      );
      setProducts(filteredData);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de charger les données");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const stats = {
    totalProducts: products.length,
    totalCities: [
      ...new Set(products.flatMap((p) => p.stocks.map((s) => s.name))),
    ].length,
    outOfStock: products.filter(
      (p) => p.stocks.reduce((sum, s) => sum + s.quantity, 0) === 0
    ).length,
    totalValue: calculateTotalValue(products),
  };

  const quickActions = [
    {
      title: "Scanner QR",
      icon: "qr-code",
      color: "#8b5cf6",
      action: () => navigation.navigate("QRScannerScreen"),
    },
    {
      title: "Nouveau Produit",
      icon: "add-circle",
      color: "#10b981",
      action: () => navigation.navigate("AddProduct"),
    },
    {
      title: "Entrepôts",
      icon: "business",
      color: "#f59e0b",
      action: () => navigation.navigate("Warehouses"),
    },
    {
      title: "Statistiques",
      icon: "bar-chart",
      color: "#3b82f6",
      action: () => navigation.navigate("Statistics"),
    },
  ];

  const generatePdfHtml = (products) => {
    const today = new Date().toLocaleDateString();
    const totalValue = calculateTotalValue(products);
    
    const productsHtml = products.map(product => {
      const totalStock = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.type}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.price} DH</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${totalStock}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${product.stocks.map(stock => 
            `${stock.name}: ${stock.quantity}`).join(', ')}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { color: #4f46e5; }
            .header { margin-bottom: 20px; }
            .summary { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #4f46e5; color: white; padding: 12px 8px; text-align: left; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport d'Inventaire</h1>
            <p>Date: ${today}</p>
          </div>
          
          <div class="summary">
            <h2>Résumé</h2>
            <p>Nombre total de produits: ${stats.totalProducts}</p>
            <p>Nombre de villes: ${stats.totalCities}</p>
            <p>Produits en rupture de stock: ${stats.outOfStock}</p>
            <p>Valeur totale de l'inventaire: ${totalValue.toLocaleString()} DH</p>
          </div>

          <h2>Liste des Produits</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Prix</th>
                <th>Stock Total</th>
                <th>Détails Stock</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
          </table>

          <div class="footer">
            <p>Généré le ${today} par ${userName}</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportToPdf = async () => {
    try {
      const html = generatePdfHtml(products);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = 'inventory-report.pdf';
        link.click();
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger le rapport d\'inventaire',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de générer le PDF. Veuillez réessayer."
      );
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.multiRemove(["secretKey", "name"]);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de se déconnecter. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getData();
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  function calculateTotalValue(products) {
    return products.reduce((total, product) => {
      const stockQuantity = product.stocks.reduce(
        (sum, stock) => sum + stock.quantity,
        0
      );
      return total + product.price * stockQuantity;
    }, 0);
  }

  const getStockStatus = (stocks) => {
    const totalQuantity = stocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0
    );
    if (totalQuantity === 0)
      return { status: "Rupture", color: "#dc2626", icon: "alert-circle" };
    if (totalQuantity < 10)
      return { status: "Stock Faible", color: "#eab308", icon: "warning" };
    return { status: "En Stock", color: "#22c55e", icon: "checkmark-circle" };
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", {
      id: product.id,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4f46e5", "#3b82f6"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Tableau de bord</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={exportToPdf}
            >
              <Ionicons name="document-text" size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications" size={20} color="#ffffff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.logoutButton]}
              onPress={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name="log-out" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#94a3b8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearSearch}
            >
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => navigation.navigate("Statistics")}
            >
              <Text style={styles.sectionButtonText}>Voir plus</Text>
              <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.elevation]}>
              <Ionicons name="cube" size={24} color="#4f46e5" />
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Produits Total</Text>
            </View>
            <View style={[styles.statCard, styles.elevation]}>
              <Ionicons name="business" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{stats.totalCities}</Text>
              <Text style={styles.statLabel}>Villes</Text>
            </View>
            <View style={[styles.statCard, styles.elevation, styles.alertCard]}>
              <Ionicons name="alert-circle" size={24} color="#dc2626" />
              <Text style={[styles.statNumber, styles.alertText]}>
                {stats.outOfStock}
              </Text>
              <Text style={styles.statLabel}>Rupture Stock</Text>
            </View>
            <View style={[styles.statCard, styles.elevation]}>
              <Ionicons name="cash" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>
                {stats.totalValue.toLocaleString()} DH
              </Text>
              <Text style={styles.statLabel}>Valeur Totale</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
          </View>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, styles.elevation]}
                onPress={action.action}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.productsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits Récents</Text>
            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => navigation.navigate("Products")}
            >
              <Text style={styles.sectionButtonText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
            </TouchableOpacity>
          </View>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateTitle}>Aucun résultat trouvé</Text>
              <Text style={styles.emptyStateText}>
                Aucun produit ne correspond à votre recherche
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stocks);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, styles.elevation]}
                  onPress={() => handleProductPress(product)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productContent}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <View
                        style={[
                          styles.stockStatusContainer,
                          { backgroundColor: stockStatus.color + "20" },
                        ]}
                      >
                        <Ionicons
                          name={stockStatus.icon}
                          size={16}
                          color={stockStatus.color}
                        />
                        <Text
                          style={[
                            styles.stockStatus,
                            { color: stockStatus.color },
                          ]}
                        >
                          {stockStatus.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productType}>{product.type}</Text>
                      <Text style={styles.productPrice}>
                        {product.price.toLocaleString()} DH
                      </Text>
                    </View>
                    <View style={styles.stocksContainer}>
                      {product.stocks.map((stock, index) => (
                        <View key={index} style={styles.stockItem}>
                          <Ionicons name="location" size={14} color="#64748b" />
                          <Text style={styles.stockInfo}>
                            {stock.name}: {stock.quantity} unités
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
          <Ionicons name="add" size={24} color="#ffffff" />
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
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ef4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  notificationText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  clearSearch: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  sectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  statCard: {
    width: "47%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  actionButton: {
    width: "47%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  productsContainer: {
    marginBottom: 24,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  productContent: {
    padding: 16,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  stockStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  productInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productType: {
    fontSize: 14,
    color: "#64748b",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4f46e5",
  },
  stocksContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
    gap: 8,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stockInfo: {
    fontSize: 14,
    color: "#64748b",
  },
  elevation: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alertCard: {
    backgroundColor: "#fef2f2",
  },
  alertText: {
    color: "#dc2626",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

export default AdminDashboard