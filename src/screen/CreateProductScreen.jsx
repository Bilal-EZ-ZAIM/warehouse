import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL = "http://172.16.10.159:3000/products";

export default function CreateProductScreen({ route, navigation }) {
  const { barcode } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    type: "",
    barcode: typeof barcode !== "undefined" ? barcode : "",
    price: "",
    solde: "",
    supplier: "",
    image: "",
  });

  const [locations, setLocations] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const handleAddLocation = () => {
    const newLocation = {
      id: Date.now(),
      name: "",
      quantity: 0,
      localisation: {
        city: "",
        latitude: 0,
        longitude: 0,
      },
    };
    setLocations([...locations, newLocation]);
  };

  const updateLocation = (index, field, value) => {
    const updatedLocations = [...locations];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      updatedLocations[index] = {
        ...updatedLocations[index],
        [parent]: {
          ...updatedLocations[index][parent],
          [child]: value,
        },
      };
    } else {
      updatedLocations[index] = {
        ...updatedLocations[index],
        [field]: value,
      };
    }
    setLocations(updatedLocations);
  };

  const removeLocation = (index) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!product.name || !product.barcode || !product.price) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      const totalStock = locations.reduce((sum, loc) => sum + loc.quantity, 0);

      const newProduct = {
        ...product,
        price: parseFloat(product.price),
        solde: product.solde ? parseFloat(product.solde) : null,
        stocks: locations,
        stock: totalStock,
        editedBy: [
          {
            warehousemanId: await AsyncStorage.getItem("secretKey"),
            at: new Date().toISOString(),
          },
        ],
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du produit");
      }

      navigation.replace("AdminDashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.imagePreviewContainer}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={48} color="#94a3b8" />
            <Text style={styles.imagePlaceholderText}>URL de l'image</Text>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>URL de l'image</Text>
        <TextInput
          style={styles.input}
          value={product.image}
          onChangeText={(text) => setProduct({ ...product, image: text })}
          placeholder="https://"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom du Produit *</Text>
        <TextInput
          style={styles.input}
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
          placeholder="Nom du produit"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={product.description}
          onChangeText={(text) => setProduct({ ...product, description: text })}
          placeholder="Description du produit"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Code-barres *</Text>
        <TextInput
          style={styles.input}
          value={product.barcode}
          onChangeText={(text) => setProduct({ ...product, barcode: text })}
          placeholder="Code-barres"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={styles.input}
          value={product.type}
          onChangeText={(text) => setProduct({ ...product, type: text })}
          placeholder="Type de produit"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fournisseur</Text>
        <TextInput
          style={styles.input}
          value={product.supplier}
          onChangeText={(text) => setProduct({ ...product, supplier: text })}
          placeholder="Nom du fournisseur"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Prix *</Text>
          <TextInput
            style={styles.input}
            value={product.price}
            onChangeText={(text) => setProduct({ ...product, price: text })}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
          <Text style={styles.label}>Prix Soldé</Text>
          <TextInput
            style={styles.input}
            value={product.solde}
            onChangeText={(text) => setProduct({ ...product, solde: text })}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.locationHeader}>
        <Text style={styles.locationTitle}>Emplacements</Text>
        <TouchableOpacity
          style={styles.addLocationButton}
          onPress={handleAddLocation}
        >
          <Ionicons name="add-circle" size={24} color="#1e40af" />
          <Text style={styles.addLocationText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {locations.map((location, index) => (
        <View key={location.id} style={styles.locationCard}>
          <View style={styles.locationCardHeader}>
            <MaterialCommunityIcons name="store" size={24} color="#1e40af" />
            <TouchableOpacity
              onPress={() => removeLocation(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'emplacement</Text>
            <TextInput
              style={styles.input}
              value={location.name}
              onChangeText={(text) => updateLocation(index, "name", text)}
              placeholder="Nom de l'emplacement"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <TextInput
              style={styles.input}
              value={location.localisation.city}
              onChangeText={(text) =>
                updateLocation(index, "localisation.city", text)
              }
              placeholder="Ville"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                style={styles.input}
                value={String(location.localisation.latitude)}
                onChangeText={(text) =>
                  updateLocation(
                    index,
                    "localisation.latitude",
                    parseFloat(text) || 0
                  )
                }
                placeholder="0.000000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                style={styles.input}
                value={String(location.localisation.longitude)}
                onChangeText={(text) =>
                  updateLocation(
                    index,
                    "localisation.longitude",
                    parseFloat(text) || 0
                  )
                }
                placeholder="0.000000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput
              style={styles.input}
              value={String(location.quantity)}
              onChangeText={(text) =>
                updateLocation(index, "quantity", parseInt(text) || 0)
              }
              placeholder="0"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      ))}

      {locations.length === 0 && (
        <View style={styles.emptyLocations}>
          <MaterialCommunityIcons name="store-off" size={48} color="#94a3b8" />
          <Text style={styles.emptyLocationsText}>
            Aucun emplacement ajouté
          </Text>
          <Text style={styles.emptyLocationsSubtext}>
            Ajoutez des emplacements pour gérer votre stock
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={["#1e40af", "#3b82f6"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Nouveau Produit</Text>
        </View>

        <View style={styles.steps}>
          {[1, 2, 3].map((step) => (
            <TouchableOpacity
              key={step}
              style={[styles.step, currentStep === step && styles.activeStep]}
              onPress={() => setCurrentStep(step)}
            >
              <Text
                style={[
                  styles.stepText,
                  currentStep === step && styles.activeStepText,
                ]}
              >
                {step}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.footerButton, styles.backStepButton]}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#64748b"
              style={styles.buttonIcon}
            />
            <Text style={styles.backStepButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={[styles.footerButton, styles.nextStepButton]}
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <Text style={styles.nextStepButtonText}>Suivant</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#ffffff"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerButton, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.submitButtonText}>Créer le Produit</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginLeft: 12,
  },
  steps: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    backgroundColor: "#ffffff",
  },
  stepText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  activeStepText: {
    color: "#1e40af",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    gap: 20,
  },
  imagePreviewContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  imagePlaceholderText: {
    color: "#94a3b8",
    marginTop: 8,
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  addLocationText: {
    color: "#1e40af",
    fontSize: 16,
    fontWeight: "600",
  },
  locationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 16,
  },
  locationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: {
    padding: 4,
  },
  emptyLocations: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyLocationsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  emptyLocationsSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  backStepButton: {
    backgroundColor: "#f1f5f9",
  },
  nextStepButton: {
    backgroundColor: "#1e40af",
  },
  submitButton: {
    backgroundColor: "#15803d",
    flex: 2,
  },
  buttonIcon: {
    marginHorizontal: 8,
  },
  backStepButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  nextStepButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
