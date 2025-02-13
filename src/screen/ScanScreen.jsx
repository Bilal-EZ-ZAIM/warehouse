import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
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
  const [selectedLocation, setSelectedLocation] = useState(null);
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

      if (data.length > 0) {
        setProduct(data[0]);
        setShowModal(true);
      } else {
        navigation.navigate("CreateProductScreen", {
          barcode: barcodeValue,
        });
      }
    } catch (err) {
      console.error("Erreur de connexion au serveur", err);
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
    if (!selectedLocation) {
      setError("Veuillez sélectionner un emplacement");
      return;
    }
  
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      setError("Veuillez saisir une quantité valide");
      return;
    }
  
    try {
      setLoading(true);
  
      const stockToUpdate = product.stocks.find(stock => stock.id === selectedLocation.id);
      
      if (!stockToUpdate) {
        throw new Error("Emplacement non trouvé dans le stock");
      }
  
      const response = await fetch(`${API_URL}/products/${product.id}/stocks/${stockToUpdate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
        }),
      });
  
      if (!response.ok) {
        throw new Error("La mise à jour a échoué");
      }
  
      const updatedStocks = product.stocks.map(stock =>
        stock.id === stockToUpdate.id
          ? { ...stock, quantity: parseInt(quantity) }
          : stock
      );
  
      setProduct({ ...product, stocks: updatedStocks });
  
      setSelectedLocation(null);
      setQuantity("");
      setError(null);
  
      alert(`Stock mis à jour avec succès pour ${selectedLocation.name}`);
    } catch (err) {
      setError(err.message || "Impossible de mettre à jour le stock");
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

  const stockStatus = getStockStatus(getTotalStock());

  const renderStockLocation = (stock) => (
    <TouchableOpacity
      key={stock.id}
      style={[
        styles.locationCard,
        selectedLocation?.id === stock.id && styles.selectedLocationCard,
      ]}
      onPress={() => setSelectedLocation(stock)}
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationNameContainer}>
          <MaterialCommunityIcons
            name="store"
            size={24}
            color={selectedLocation?.id === stock.id ? "#1e40af" : "#64748b"}
          />
          <Text
            style={[
              styles.locationName,
              selectedLocation?.id === stock.id && styles.selectedLocationText,
            ]}
          >
            {stock.name}
          </Text>
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
    </TouchableOpacity>
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
        onRequestClose={() => {
          setShowModal(false);
          setSelectedLocation(null);
          setQuantity("");
        }}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Détails du Produit</Text>
                <Text style={styles.modalSubtitle}>#{product?.barcode}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  setSelectedLocation(null);
                  setQuantity("");
                }}
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
                  </View>
                </>
              ) : (
                <View style={styles.stocksContainer}>
                  <View style={styles.stocksSummary}>
                    <Text style={styles.stocksSummaryTitle}>
                      Sélectionnez un emplacement pour mettre à jour le stock
                    </Text>
                    <Text style={styles.stocksSummaryText}>
                      {product?.stocks?.length || 0} emplacements disponibles
                    </Text>
                  </View>
                  {product?.stocks?.map(renderStockLocation)}

                  {selectedLocation && (
                    <View style={styles.updateStockSection}>
                      <Text style={styles.updateStockTitle}>
                        Mise à jour du stock pour {selectedLocation.name}
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
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowModal(false);
                  setSelectedLocation(null);
                  setQuantity("");
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.updateButton,
                  (!selectedLocation || !quantity) && styles.disabledButton,
                ]}
                onPress={updateProduct}
                disabled={loading || !selectedLocation || !quantity}
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
    backgroundColor: "#f1f5f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e7ff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: "relative",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#ffffff",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#ffffff",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#ffffff",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#ffffff",
  },
  scanText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  manualSection: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1e293b",
  },
  searchButton: {
    backgroundColor: "#1e40af",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: "#dc2626",
    marginLeft: 8,
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#1e40af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    margin: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#64748b",
  },
  activeTabText: {
    color: "#1e40af",
    fontWeight: "600",
  },
  modalBody: {
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  productInfo: {
    padding: 20,
  },
  productHeader: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  priceContainer: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  soldPrice: {
    fontSize: 16,
    color: "#dc2626",
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
  },
  stocksContainer: {
    padding: 20,
  },
  stocksSummary: {
    marginBottom: 20,
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
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedLocationCard: {
    borderColor: "#1e40af",
    borderWidth: 2,
    backgroundColor: "#f0f9ff",
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
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  selectedLocationText: {
    color: "#1e40af",
    fontWeight: "600",
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  quantityBadgeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  locationDetails: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  locationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    color: "#64748b",
  },
  updateStockSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e40af",
  },
  updateStockTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 12,
  },
  quantityInputContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quantityInput: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  updateButton: {
    backgroundColor: "#1e40af",
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loadingGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingMessage: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 12,
  },
  errorGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorMessage: {
    fontSize: 18,
    color: "#dc2626",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ScanScreen;
