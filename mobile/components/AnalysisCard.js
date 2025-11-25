import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SeverityBadge from './SeverityBadge';
import { COLORS } from '../constants/colors';

export default function AnalysisCard({ analysis, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta análise?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(analysis.id) }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.date}>{formatDate(analysis.createdAt)}</Text>
          <SeverityBadge severity={analysis.severity} />
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: analysis.imageBase64 }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.accuracy}>
        <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
        <Text style={styles.accuracyText}>
          Confiança: {(analysis.accuracy * 100).toFixed(0)}%
        </Text>
      </View>

      <Text style={styles.commentaries}>{analysis.commentaries}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  headerLeft: {
    flex: 1,
    gap: 8
  },
  date: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500'
  },
  deleteButton: {
    padding: 4
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12
  },
  accuracy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  accuracyText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500'
  },
  commentaries: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20
  }
});
