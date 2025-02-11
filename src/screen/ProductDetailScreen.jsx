import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export function ProductDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollY = new Animated.Value(0);

  const product = {
    id: 1,
    name: "Laptop HP Pavilion",
    type: "Informatique",
    price: "12000",
    description:
      'Laptop HP Pavilion avec processeur Intel Core i7, 16GB RAM, 512GB SSD, écran 15.6" Full HD',
    image:
      "https://mediazone.ma/uploads/images/products/16412/landing-page/assets/images/swiper-1.png",
    stock: 21,
    status: "En stock",
    supplier: "HP Maroc",
    specifications: {
      processor: "Intel Core i7-1165G7",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      screen: '15.6" Full HD IPS',
      graphics: "Intel Iris Xe Graphics",
      os: "Windows 11",
    },
    lastUpdated: "2024-02-11",
    location: "Magasin Central",
    sku: "HP-PAV-15-2024",
  };

  const renderSpecification = (label, value) => (
    <View style={styles.specRow} key={label}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            opacity: headerOpacity,
            top: -insets.top,
            height: 60 + insets.top,
          },
        ]}
      >
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Animated.Text
          style={[
            styles.headerTitle,
            {
              opacity: headerOpacity,
            },
          ]}
        >
          {product.name}
        </Animated.Text>
      </View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Info Card */}
        <View style={styles.card}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productType}>{product.type}</Text>
          <Text style={styles.productPrice}>{product.price} DH</Text>

          <View style={[styles.statusContainer, styles.statusBackground(product.stock)]}>
            <Text style={styles.statusText(product.stock)}>
              {product.status} • {product.stock} unités
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Specifications Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Spécifications</Text>
          <View style={styles.specificationsContainer}>
            {Object.entries(product.specifications).map(([key, value]) =>
              renderSpecification(key.charAt(0).toUpperCase() + key.slice(1), value)
            )}
          </View>
        </View>

        {/* Additional Info Card */}
        <View style={[styles.card, styles.lastCard]}>
          <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
          <View style={styles.additionalInfo}>
            {renderSpecification("Fournisseur", product.supplier)}
            {renderSpecification("Emplacement", product.location)}
            {renderSpecification("SKU", product.sku)}
            {renderSpecification("Dernière mise à jour", product.lastUpdated)}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate("EditProduct", { id: product.id })}
        >
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.updateStockButton]}
          onPress={() => navigation.navigate("UpdateStock", { id: product.id })}
        >
          <Text style={styles.actionButtonText}>Mettre à jour le stock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  backButtonText: {
    fontSize: 24,
    color: "#1e293b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lastCard: {
    marginBottom: 100, // Space for action buttons
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  productType: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 16,
  },
  statusBackground: (stock) => ({
    backgroundColor: stock > 10 ? "#dcfce7" : stock > 0 ? "#fef3c7" : "#fee2e2",
    borderRadius: 12,
    padding: 12,
  }),
  statusText: (stock) => ({
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: stock > 10 ? "#16a34a" : stock > 0 ? "#d97706" : "#dc2626",
  }),
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  specificationsContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  specLabel: {
    fontSize: 15,
    color: "#64748b",
    flex: 1,
  },
  specValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  editButton: {
    backgroundColor: "#4f46e5",
  },
  updateStockButton: {
    backgroundColor: "#3b82f6",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductDetailScreen;