import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export function LoginScreen({ navigation }) {
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (secretKey) => {
    try {
      const response = await fetch("http://172.16.10.159:3000/warehousemans");
      const data = await response.json();

      const user = data.find((user) => user.secretKey === secretKey);
      if (user) {
        await AsyncStorage.setItem("secretKey", user.secretKey);
        await AsyncStorage.setItem("name", user.name);
        return user;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!secretKey.trim()) {
      setError("Veuillez entrer votre code secret");
      return;
    }

    setLoading(true);
    try {
      const user = await login(secretKey);
      if (user) {
        const storedSecretKey = await AsyncStorage.getItem("secretKey");
        if (storedSecretKey === "AH90907J") {
          navigation.replace("AdminDashboard");
        } else {
          navigation.replace("Home");
        }
      } else {
        setError("Code secret invalide");
      }
    } catch (err) {
      Alert.alert(
        "Erreur de connexion",
        "Impossible de s'authentifier. Veuillez réessayer."
      );
      setError("Une erreur s'est produite, veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/1163/1163655.png",
                }}
                style={styles.logo}
              />
              <Text style={styles.title}>Warehouse Manager Pro</Text>
              <Text style={styles.subtitle}>
                Gestion efficace des stocks et inventaires
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Code Secret</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Entrez votre code secret"
                  secureTextEntry
                  value={secretKey}
                  onChangeText={(text) => {
                    setSecretKey(text);
                    setError("");
                  }}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.loginButtonText}>ACCÉDER AU SYSTÈME</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2024 Warehouse Manager Pro. Tous droits réservés.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 48,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginBottom: 24,
  },
  footerText: {
    color: "#e0e7ff",
    fontSize: 12,
  },
});

export default LoginScreen;