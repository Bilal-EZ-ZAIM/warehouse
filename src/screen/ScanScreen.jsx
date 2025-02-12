import React, { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const API_URL = "http://172.16.10.159:3000/products";

const LOW_STOCK_THRESHOLD = 10;
const MEDIUM_STOCK_THRESHOLD = 30;

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const navigation = useNavigation();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const getStockStatus = (stock) => {
    if (stock <= LOW_STOCK_THRESHOLD) {
      return { color: "#dc2626", text: "Stock Faible", icon: "alert-circle" };
    } else if (stock <= MEDIUM_STOCK_THRESHOLD) {
      return { color: "#eab308", text: "Stock Moyen", icon: "alert" };
    }
    return { color: "#22c55e", text: "En Stock", icon: "checkmark-circle" };
  };

  const getTotalStock = () => {
    return (
      product?.stocks?.reduce((total, stock) => total + stock.quantity, 0) || 0
    );
  };

  const searchProduct = async (barcodeValue) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}?barcode=${barcodeValue}`);
  
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche du produit");
      }
  
      const data = await response.json();
      console.log(data); // يمكنك فقط إبقاء هذا في بيئة التطوير إذا كنت تحتاجه.
  
      if (data.length > 0) {
        setProduct(data[0]);
        setShowModal(true);
      } else {
        navigation.navigate("CreateProductScreen", {
          barcode: barcodeValue,
        });
      }
    } catch (err) {
      console.error("Erreur de connexion au serveur", err); // استخدام console.error بدلاً من console.log
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data);
      searchProduct(data);
    }
  };

  const handleManualSearch = () => {
    if (barcode.length < 8) {
      setError("Le code-barres doit contenir au moins 8 chiffres");
      return;
    }
    searchProduct(barcode);
  };

  const updateProduct = async () => {
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      setError("Veuillez saisir une quantité valide");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${product?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: parseInt(quantity),
        }),
      });

      if (!response.ok) {
        throw new Error("La mise à jour a échoué");
      }

      setShowModal(false);
      setScanned(false);
      setBarcode("");
      setQuantity("");
      setError(null);
    } catch (err) {
      setError("Impossible de mettre à jour le stock");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <LinearGradient
          colors={["#1e40af", "#3b82f6"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingMessage}>
            Demande d'accès à la caméra...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <LinearGradient
          colors={["#fee2e2", "#fecaca"]}
          style={styles.errorGradient}
        >
          <Ionicons name="camera-off" size={48} color="#dc2626" />
          <Text style={styles.errorMessage}>Accès à la caméra refusé</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => requestPermission()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  const stockStatus = product ? getStockStatus(product.stock) : null;

  const renderStockLocation = (stock) => (
    <View key={stock.id} style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationNameContainer}>
          <MaterialCommunityIcons name="store" size={24} color="#1e40af" />
          <Text style={styles.locationName}>{stock.name}</Text>
        </View>
        <View
          style={[
            styles.quantityBadge,
            { backgroundColor: getStockStatus(stock.quantity).color },
          ]}
        >
          <Text style={styles.quantityBadgeText}>{stock.quantity}</Text>
        </View>
      </View>

      <View style={styles.locationDetails}>
        <View style={styles.locationDetail}>
          <Ionicons name="location" size={16} color="#64748b" />
          <Text style={styles.locationText}>{stock.localisation.city}</Text>
        </View>
        <View style={styles.locationDetail}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={16}
            color="#64748b"
          />
          <Text style={styles.locationText}>
            {stock.localisation.latitude.toFixed(6)},{" "}
            {stock.localisation.longitude.toFixed(6)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <Text style={styles.title}>Scanner de Produits</Text>
        <Text style={styles.subtitle}>Scannez ou saisissez un code-barres</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.cameraContainer}>
          {loading ? (
            <BlurView intensity={100} style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#1e40af" />
              <Text style={styles.loadingText}>Recherche du produit...</Text>
            </BlurView>
          ) : (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
                <Text style={styles.scanText}>
                  Placez le code-barres dans le cadre
                </Text>
              </View>
            </CameraView>
          )}
        </View>

        <View style={styles.manualSection}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="barcode-outline"
              size={24}
              color="#64748b"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Saisir le code-barres manuellement"
              placeholderTextColor="#94a3b8"
              value={barcode}
              onChangeText={setBarcode}
              keyboardType="numeric"
              maxLength={13}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleManualSearch}
              disabled={loading}
            >
              <Ionicons name="search" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Détails du Produit</Text>
                <Text style={styles.modalSubtitle}>#{product?.barcode}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "details" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("details")}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={activeTab === "details" ? "#1e40af" : "#64748b"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "details" && styles.activeTabText,
                  ]}
                >
                  Détails
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "stocks" && styles.activeTab]}
                onPress={() => setActiveTab("stocks")}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={activeTab === "stocks" ? "#1e40af" : "#64748b"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "stocks" && styles.activeTabText,
                  ]}
                >
                  Emplacements
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeTab === "details" ? (
                <>
                  {product?.image && (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}

                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product?.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Prix</Text>
                        <Text style={styles.productPrice}>
                          {product?.price.toLocaleString()} DH
                        </Text>
                        {product?.solde && (
                          <Text style={styles.soldPrice}>
                            Solde: {product.solde.toLocaleString()} DH
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Description</Text>
                      <Text style={styles.description}>
                        {product?.description}
                      </Text>
                    </View>

                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <MaterialCommunityIcons
                          name="package-variant"
                          size={24}
                          color="#1e40af"
                        />
                        <Text style={styles.statLabel}>Type</Text>
                        <Text style={styles.statValue}>
                          {product?.type || "N/A"}
                        </Text>
                      </View>

                      <View style={styles.statCard}>
                        <MaterialCommunityIcons
                          name="factory"
                          size={24}
                          color="#1e40af"
                        />
                        <Text style={styles.statLabel}>Fournisseur</Text>
                        <Text style={styles.statValue}>
                          {product?.supplier || "N/A"}
                        </Text>
                      </View>

                      <View style={styles.statCard}>
                        <Ionicons
                          name={stockStatus?.icon}
                          size={24}
                          color={stockStatus?.color}
                        />
                        <Text style={styles.statLabel}>Stock Total</Text>
                        <Text
                          style={[
                            styles.statValue,
                            { color: stockStatus?.color },
                          ]}
                        >
                          {getTotalStock()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.quantityContainer}>
                      <Text style={styles.quantityLabel}>
                        Mettre à jour le stock
                      </Text>
                      <View style={styles.quantityInputContainer}>
                        <TextInput
                          style={styles.quantityInput}
                          value={quantity}
                          onChangeText={setQuantity}
                          keyboardType="numeric"
                          placeholder="Nouvelle quantité"
                          placeholderTextColor="#94a3b8"
                        />
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.stocksContainer}>
                  <View style={styles.stocksSummary}>
                    <Text style={styles.stocksSummaryTitle}>
                      Répartition du Stock
                    </Text>
                    <Text style={styles.stocksSummaryText}>
                      {product?.stocks?.length || 0} emplacements
                    </Text>
                  </View>
                  {product?.stocks?.map(renderStockLocation)}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={updateProduct}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color="#ffffff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.updateButtonText}>Mettre à jour</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingGradient: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  loadingMessage: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 12,
  },
  errorGradient: {
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  errorMessage: {
    color: "#dc2626",
    fontSize: 16,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#dc2626",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  cameraContainer: {
    width: "100%",
    height: 300,
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#1e40af",
    backgroundColor: "transparent",
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#ffffff",
  },
  cornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#ffffff",
  },
  cornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#ffffff",
  },
  cornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#ffffff",
  },
  scanText: {
    color: "#ffffff",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#1e293b",
    marginTop: 12,
    fontSize: 16,
  },
  manualSection: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1e293b",
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: "#1e40af",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    marginTop: 12,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#e0e7ff",
  },
  tabText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1e40af",
  },
  modalBody: {
    padding: 20,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  productInfo: {
    gap: 20,
  },
  productHeader: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  priceContainer: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  priceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e40af",
  },
  soldPrice: {
    fontSize: 16,
    color: "#dc2626",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  quantityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  quantityInputContainer: {
    alignItems: "center",
  },
  quantityInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  stocksContainer: {
    gap: 16,
  },
  stocksSummary: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  stocksSummaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  stocksSummaryText: {
    fontSize: 14,
    color: "#64748b",
  },
  locationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quantityBadgeText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  locationDetails: {
    gap: 8,
  },
  locationDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  updateButton: {
    backgroundColor: "#1e40af",
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ScanScreen;
