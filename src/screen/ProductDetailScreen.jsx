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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export function ProductDetailScreen() {
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
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4f46e5", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du produit</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* صورة المنتج */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        {/* معلومات المنتج الأساسية */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productType}>{product.type}</Text>
          <Text style={styles.productPrice}>{product.price} DH</Text>

          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                product.stock > 10
                  ? styles.inStock
                  : product.stock > 0
                  ? styles.lowStock
                  : styles.outOfStock,
              ]}
            >
              {product.status} • {product.stock} unités
            </Text>
          </View>
        </View>

        {/* وصف المنتج */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* المواصفات */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spécifications</Text>
          <View style={styles.specificationsContainer}>
            {renderSpecification(
              "Processeur",
              product.specifications.processor
            )}
            {renderSpecification("RAM", product.specifications.ram)}
            {renderSpecification("Stockage", product.specifications.storage)}
            {renderSpecification("Écran", product.specifications.screen)}
            {renderSpecification(
              "Carte graphique",
              product.specifications.graphics
            )}
            {renderSpecification("Système", product.specifications.os)}
          </View>
        </View>

        {/* معلومات إضافية */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
          <View style={styles.additionalInfo}>
            {renderSpecification("Fournisseur", product.supplier)}
            {renderSpecification("Emplacement", product.location)}
            {renderSpecification("SKU", product.sku)}
            {renderSpecification("Dernière mise à jour", product.lastUpdated)}
          </View>
        </View>
      </ScrollView>

      {/* أزرار الإجراءات */}
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
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  productType: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 15,
  },
  statusContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 10,
  },
  statusText: {
    fontSize: 16,
    textAlign: "center",
  },
  inStock: {
    color: "#16a34a",
  },
  lowStock: {
    color: "#d97706",
  },
  outOfStock: {
    color: "#dc2626",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  specificationsContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  specLabel: {
    fontSize: 15,
    color: "#64748b",
  },
  specValue: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: "500",
  },
  additionalInfo: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    overflow: "hidden",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
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
    marginHorizontal: 5,
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
