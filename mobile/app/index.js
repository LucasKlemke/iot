import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="healing" size={80} color={COLORS.primary} />

        <Text style={styles.title}>IoT Cancer Detector</Text>
        <Text style={styles.subtitle}>
          Análise preliminar de lesões de pele com IA
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/new-analysis')}
          >
            <MaterialIcons name="camera-alt" size={24} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Nova Análise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/history')}
          >
            <MaterialIcons name="history" size={24} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <MaterialIcons name="info-outline" size={20} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            Este aplicativo não substitui avaliação médica profissional
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 24,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 48,
    gap: 16
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
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18
  }
});
