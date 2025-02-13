import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export function ProductDetailScreen({ navigation, route }) {
  const { id } = route.params;
  console.log(id);
  
  const insets = useSafeAreaInsets();
  const scrollY = new Animated.Value(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [productData, setProductData] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [newStock, setNewStock] = useState("");
  console.log(navigation);
  

  useEffect(() => {
    checkAdminStatus();
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      const response = await fetch("http://172.16.10.159:3000/products/"+id);
      const data = await response.json();
      setProductData(data);
      setEditedProduct(data);
      setNewStock(
        data.stocks.reduce((acc, stock) => acc + stock.quantity, 0).toString()
      );
    } catch (error) {
      console.error("Error fetching product data:", error);
      Alert.alert("Erreur", "Impossible de charger les données du produit");
    }
  };

  const checkAdminStatus = async () => {
    try {
      const secretKey = await AsyncStorage.getItem("secretKey");
      setIsAdmin(secretKey === "AH90907J");
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const handleUpdateProduct = () => {
    // Here you would typically make an API call to update the product
    setProductData(editedProduct);
    setEditModalVisible(false);
    Alert.alert("Succès", "Le produit a été mis à jour avec succès");
  };

  const handleUpdateStock = () => {
    // Here you would typically make an API call to update the stock
    setProductData({
      ...productData,
      stocks: productData.stocks.map((stock) => ({
        ...stock,
        quantity: parseInt(newStock),
      })),
    });
    setStockModalVisible(false);
    Alert.alert("Succès", "Le stock a été mis à jour avec succès");
  };

  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier le produit</Text>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.inputLabel}>Nom du produit</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.name}
              onChangeText={(text) =>
                setEditedProduct({ ...editedProduct, name: text })
              }
            />

            <Text style={styles.inputLabel}>Type</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.type}
              onChangeText={(text) =>
                setEditedProduct({ ...editedProduct, type: text })
              }
            />

            <Text style={styles.inputLabel}>Prix (DH)</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.price.toString()}
              onChangeText={(text) =>
                setEditedProduct({ ...editedProduct, price: text })
              }
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedProduct.description}
              onChangeText={(text) =>
                setEditedProduct({ ...editedProduct, description: text })
              }
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Fournisseur</Text>
            <TextInput
              style={styles.input}
              value={editedProduct.supplier}
              onChangeText={(text) =>
                setEditedProduct({ ...editedProduct, supplier: text })
              }
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateProduct}
            >
              <Text style={styles.modalButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStockModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={stockModalVisible}
      onRequestClose={() => setStockModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.stockModalContent]}>
          <Text style={styles.modalTitle}>Mettre à jour le stock</Text>

          <View style={styles.stockInputContainer}>
            <Text style={styles.inputLabel}>Quantité en stock</Text>
            <TextInput
              style={[styles.input, styles.stockInput]}
              value={newStock}
              onChangeText={setNewStock}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setStockModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateStock}
            >
              <Text style={styles.modalButtonText}>Mettre à jour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderActionButtons = () => {
    if (!isAdmin) {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.backHomeButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.actionButtonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.updateStockButton]}
          onPress={() => setStockModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>Mettre à jour le stock</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!productData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {renderEditModal()}
      {renderStockModal()}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: productData.image }}
            style={styles.productImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.gradient}
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.productName}>{productData.name}</Text>
            <Text style={styles.productType}>{productData.type}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{productData.price} DH</Text>
            <View
              style={[
                styles.statusBadge,
                productData.stocks.reduce(
                  (acc, stock) => acc + stock.quantity,
                  0
                ) > 10
                  ? styles.inStock
                  : productData.stocks.reduce(
                      (acc, stock) => acc + stock.quantity,
                      0
                    ) > 0
                  ? styles.lowStock
                  : styles.outOfStock,
              ]}
            >
              <Text style={styles.statusText}>
                {productData.stocks.reduce(
                  (acc, stock) => acc + stock.quantity,
                  0
                ) > 10
                  ? "En stock"
                  : productData.stocks.reduce(
                      (acc, stock) => acc + stock.quantity,
                      0
                    ) > 0
                  ? "Stock faible"
                  : "Rupture de stock"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{productData.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stocks</Text>
            {productData.stocks.map((stock) => (
              <View key={stock.id} style={styles.stockItem}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <Text style={styles.stockQuantity}>
                  Quantité: {stock.quantity}
                </Text>
                <Text style={styles.stockLocation}>
                  Localisation: {stock.localisation.city}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {renderActionButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: width * 0.8,
    width: "100%",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  productType: {
    fontSize: 16,
    color: "#64748b",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  inStock: {
    backgroundColor: "#dcfce7",
  },
  lowStock: {
    backgroundColor: "#fef9c3",
  },
  outOfStock: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
  },
  stockItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stockName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  stockQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  stockLocation: {
    fontSize: 14,
    color: "#64748b",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  backHomeButton: {
    backgroundColor: "#4f46e5",
  },
  editButton: {
    backgroundColor: "#4f46e5",
  },
  updateStockButton: {
    backgroundColor: "#0891b2",
  },
  actionButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  stockModalContent: {
    maxHeight: "40%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: "70%",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  stockInput: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  saveButton: {
    backgroundColor: "#4f46e5",
  },
  modalButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  stockInputContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
});

export default ProductDetailScreen;
