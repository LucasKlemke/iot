import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import AnalysisCard from '../components/AnalysisCard';
import { COLORS } from '../constants/colors';
import { API_URL } from '../constants/config';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analysis`);
      setAnalyses(response.data);
    } catch (error) {
      console.error('Error loading analyses:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar o histórico. Verifique sua conexão.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAnalyses();
    }, [])
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/analysis/${id}`);
      setAnalyses(analyses.filter(analysis => analysis.id !== id));
    } catch (error) {
      console.error('Error deleting analysis:', error);
      Alert.alert(
        'Erro',
        'Não foi possível excluir a análise. Tente novamente.'
      );
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="insert-drive-file" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>Nenhuma análise realizada</Text>
      <Text style={styles.emptySubtext}>
        Suas análises aparecerão aqui
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnalysisCard analysis={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadAnalyses}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContent: {
    padding: 16,
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8
  }
});
