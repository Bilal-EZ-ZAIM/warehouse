import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';



const API_URL = "http://localhost:3000/products";

export function ProductScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    type: '',
    price: '',
    supplier: '',
    barcode: route.params?.barcode || '',
    initialStock: '0',
    warehouse: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.type.trim()) newErrors.type = 'Le type est requis';
    if (!formData.price.trim()) newErrors.price = 'Le prix est requis';
    if (isNaN(Number(formData.price))) newErrors.price = 'Prix invalide';
    if (!formData.barcode.trim()) newErrors.barcode = 'Le code-barres est requis';
    if (Number(formData.initialStock) > 0 && !formData.warehouse.trim()) {
      newErrors.warehouse = "L'entrepôt est requis pour un stock initial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible de charger l'image");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          initialStock: Number(formData.initialStock),
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      Alert.alert(
        'Succès',
        'Produit créé avec succès',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le produit');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field , value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4f46e5', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouveau Produit</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePick}
        >
          {formData.image ? (
            <Image
              source={{ uri: formData.image }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#94a3b8" />
              <Text style={styles.imagePlaceholderText}>
                Ajouter une image
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du produit *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Nom du produit"
              placeholderTextColor="#94a3b8"
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type de produit *</Text>
            <TextInput
              style={[styles.input, errors.type && styles.inputError]}
              value={formData.type}
              onChangeText={(value) => updateField('type', value)}
              placeholder="Type de produit"
              placeholderTextColor="#94a3b8"
            />
            {errors.type && (
              <Text style={styles.errorText}>{errors.type}</Text>
            )}
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prix *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                value={formData.price}
                onChangeText={(value) => updateField('price', value)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#94a3b8"
              />
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Code-barres *</Text>
              <TextInput
                style={[styles.input, errors.barcode && styles.inputError]}
                value={formData.barcode}
                onChangeText={(value) => updateField('barcode', value)}
                placeholder="Code-barres"
                keyboardType="number-pad"
                editable={!route.params?.barcode}
                placeholderTextColor="#94a3b8"
              />
              {errors.barcode && (
                <Text style={styles.errorText}>{errors.barcode}</Text>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fournisseur</Text>
            <TextInput
              style={styles.input}
              value={formData.supplier}
              onChangeText={(value) => updateField('supplier', value)}
              placeholder="Nom du fournisseur"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Stock initial</Text>
              <TextInput
                style={styles.input}
                value={formData.initialStock}
                onChangeText={(value) => updateField('initialStock', value)}
                placeholder="0"
                keyboardType="number-pad"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Entrepôt</Text>
              <TextInput
                style={[styles.input, errors.warehouse && styles.inputError]}
                value={formData.warehouse}
                onChangeText={(value) => updateField('warehouse', value)}
                placeholder="Nom de l'entrepôt"
                placeholderTextColor="#94a3b8"
              />
              {errors.warehouse && (
                <Text style={styles.errorText}>{errors.warehouse}</Text>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Description du produit"
              multiline
              numberOfLines={4}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Créer le produit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    height: 56,
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ProductScreen;