import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';

export function LoginScreen({ navigation }) {
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // دالة التوثيق المحلية
    const login = async (secretKey) => {
        if (secretKey === 'yourSecretKey') {
            return true;
        }
        return false;
    };

    const handleLogin = async () => {
        if (!secretKey) {
            setError('Please enter your secret code');
            return;
        }

        setLoading(true);
        try {
            const success = await login(secretKey);
            if (success) {
                navigation.replace('ProductList');
            } else {
                setError('Invalid secret code');
            }
        } catch (err) {
            Alert.alert('Login Error', 'Unable to authenticate. Please try again.');
            setError('An error occurred, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.loginBox}>
                <View style={styles.headerSection}>
                    <Image 
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1163/1163655.png' }} // أيقونة إدارة مخزن
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Warehouse Manager Pro</Text>
                    <Text style={styles.subtitle}>Efficient Inventory Management</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Secret Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your secret code"
                            secureTextEntry
                            value={secretKey}
                            onChangeText={(text) => {
                                setSecretKey(text);
                                setError('');
                            }}
                            placeholderTextColor="#B0B0B0"
                        />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>ACCESS SYSTEM</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0', // خلفية فاتحة
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%', // جعل الواجهة تأخذ 100% عرض
    },
    loginBox: {
        width: '100%', // تأخذ 100% العرض
        backgroundColor: '#FFFFFF',
        padding: 25,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#00796B', // لون أخضر داكن مرتبط بالمخزون
    },
    subtitle: {
        fontSize: 14,
        color: '#777',
        marginBottom: 20,
    },
    formContainer: {
        marginTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 20,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#F5F5F5',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 15,
    },
    loginButton: {
        backgroundColor: '#00796B', // لون أخضر داكن
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
