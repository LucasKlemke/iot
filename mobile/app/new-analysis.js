import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import SeverityBadge from '../components/SeverityBadge';
import { COLORS } from '../constants/colors';
import { API_URL } from '../constants/config';

export default function NewAnalysis() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Este app precisa de acesso à câmera e galeria para funcionar.'
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const pickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });

      const response = await axios.post(`${API_URL}/analysis`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Erro',
        'Não foi possível analisar a imagem. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!image && !result && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <MaterialIcons name="camera-alt" size={24} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>
      )}

      {image && !result && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetAnalysis}
              disabled={loading}
            >
              <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Nova Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={analyzeImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <MaterialIcons name="analytics" size={24} color={COLORS.white} />
                  <Text style={styles.primaryButtonText}>Analisar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Image
            source={{ uri: result.imageBase64 }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Resultado da Análise</Text>
              <SeverityBadge severity={result.severity} />
            </View>

            <View style={styles.accuracyBar}>
              <View style={styles.accuracyLabel}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                <Text style={styles.accuracyText}>
                  Confiança: {(result.accuracy * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${result.accuracy * 100}%` }
                  ]}
                />
              </View>
            </View>

            <Text style={styles.commentaries}>{result.commentaries}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={resetAnalysis}>
              <MaterialIcons name="add" size={24} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Nova Análise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/history')}
            >
              <MaterialIcons name="history" size={24} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Ver Histórico</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: 24
  },
  buttonsContainer: {
    gap: 16,
    marginTop: 16
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: 8
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  imageContainer: {
    gap: 16
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 12
  },
  resultContainer: {
    gap: 16
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text
  },
  accuracyBar: {
    gap: 8
  },
  accuracyLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  accuracyText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500'
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  commentaries: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20
  }
});
