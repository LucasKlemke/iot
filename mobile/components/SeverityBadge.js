import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SeverityBadge({ severity }) {
  const severityConfig = {
    low: { color: COLORS.severityLow, label: 'Baixo' },
    medium: { color: COLORS.severityMedium, label: 'Médio' },
    high: { color: COLORS.severityHigh, label: 'Alto' },
    extreme: { color: COLORS.severityExtreme, label: 'Extremo' }
  };

  const config = severityConfig[severity] || severityConfig.low;

  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  label: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600'
  }
});
