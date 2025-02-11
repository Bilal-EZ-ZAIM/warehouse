import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export function AddProductScreen({ navigation }) {
    const [scanning, setScanning] = useState(false);
    const [product, setProduct] = useState({
        name: '',
        type: '',
        barcode: '',
        price: '',
        solde: '',
        supplier: '',
        image: null,
        initialStock: '0',
        warehouseId: ''
    });

    const [warehouses] = useState([
        { id: '1999', name: 'Gueliz B2' },
        { id: '2991', name: 'Lazari H2' }
    ]);

    const handleBarCodeScanned = ({ data }) => {
        setProduct(prev => ({ ...prev, barcode: data }));
        setScanning(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProduct(prev => ({ ...prev, image: result.assets[0].uri }));
        }
    };

    const handleSubmit = () => {
        // Validation
        if (!product.name || !product.type || !product.price || !product.supplier) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Here you would typically send the data to your backend
        console.log('Product data:', product);
        Alert.alert('Succès', 'Produit ajouté avec succès');
        navigation.goBack();
    };

    if (scanning) {
        return (
            <View style={styles.container}>
                <BarCodeScanner
                    onBarCodeScanned={handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setScanning(false)}
                >
                    <Text style={styles.closeButtonText}>Annuler</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Retour</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouveau Produit</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Barcode Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Code-barres</Text>
                    <View style={styles.barcodeContainer}>
                        <TextInput
                            style={[styles.input, styles.barcodeInput]}
                            value={product.barcode}
                            onChangeText={(text) => setProduct(prev => ({ ...prev, barcode: text }))}
                            placeholder="Entrer le code-barres"
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => setScanning(true)}
                        >
                            <Text style={styles.scanButtonText}>Scanner</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Basic Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Produit</Text>
                    <TextInput
                        style={styles.input}
                        value={product.name}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, name: text }))}
                        placeholder="Nom du produit *"
                    />
                    <TextInput
                        style={styles.input}
                        value={product.type}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, type: text }))}
                        placeholder="Type de produit *"
                    />
                    <TextInput
                        style={styles.input}
                        value={product.supplier}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, supplier: text }))}
                        placeholder="Fournisseur *"
                    />
                </View>

                {/* Price Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Prix</Text>
                    <TextInput
                        style={styles.input}
                        value={product.price}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, price: text }))}
                        placeholder="Prix régulier *"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={product.solde}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, solde: text }))}
                        placeholder="Prix soldé (optionnel)"
                        keyboardType="numeric"
                    />
                </View>

                {/* Stock Initial Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stock Initial</Text>
                    <TextInput
                        style={styles.input}
                        value={product.initialStock}
                        onChangeText={(text) => setProduct(prev => ({ ...prev, initialStock: text }))}
                        placeholder="Quantité initiale"
                        keyboardType="numeric"
                    />
                    {parseInt(product.initialStock) > 0 && (
                        <View style={styles.warehouseSelector}>
                            <Text style={styles.label}>Sélectionner l'entrepôt *</Text>
                            <View style={styles.warehouseButtons}>
                                {warehouses.map((warehouse) => (
                                    <TouchableOpacity
                                        key={warehouse.id}
                                        style={[
                                            styles.warehouseButton,
                                            product.warehouseId === warehouse.id && styles.warehouseButtonSelected
                                        ]}
                                        onPress={() => setProduct(prev => ({ ...prev, warehouseId: warehouse.id }))}
                                    >
                                        <Text style={[
                                            styles.warehouseButtonText,
                                            product.warehouseId === warehouse.id && styles.warehouseButtonTextSelected
                                        ]}>
                                            {warehouse.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Image Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Image du Produit</Text>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                        {product.image ? (
                            <Image source={{ uri: product.image }} style={styles.productImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>+ Ajouter une image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Ajouter le Produit</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    backButton: {
        fontSize: 16,
        color: '#2563eb'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    content: {
        flex: 1,
        padding: 16
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16
    },
    barcodeContainer: {
        flexDirection: 'row',
        gap: 8
    },
    barcodeInput: {
        flex: 1
    },
    scanButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center'
    },
    scanButtonText: {
        color: 'white',
        fontWeight: '600'
    },
    warehouseSelector: {
        marginTop: 8
    },
    label: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8
    },
    warehouseButtons: {
        flexDirection: 'row',
        gap: 8
    },
    warehouseButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center'
    },
    warehouseButtonSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb'
    },
    warehouseButtonText: {
        color: '#64748b',
        fontWeight: '500'
    },
    warehouseButtonTextSelected: {
        color: 'white'
    },
    imagePickerButton: {
        width: '100%',
        height: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imagePlaceholderText: {
        color: '#64748b',
        fontSize: 16
    },
    submitButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginVertical: 24
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    },
    closeButton: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    closeButtonText: {
        color: '#2563eb',
        fontSize: 16,
        fontWeight: '600'
    }
});