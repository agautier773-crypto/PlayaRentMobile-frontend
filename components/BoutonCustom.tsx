import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Définir la "forme" des props avec TypeScript
type BoutonCustomProps = {
  text: string;
  backgroundColor: string;
  onPress: () => void;
  disabled?: boolean;       // optionnel : grise + bloque le bouton
  loading?: boolean;        // optionnel : affiche un spinner à la place du texte
  textColor?: string;       // optionnel : pour cas particuliers
};

// Le composant qui reçoit les props
export default function BoutonCustom({
  text,
  backgroundColor,
  onPress,
  disabled = false,
  loading = false,
  textColor = '#FFFFFF',
}: BoutonCustomProps) {
  const isBlocked = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isBlocked ? '#CCCCCC' : backgroundColor }
      ]}
      onPress={onPress}
      disabled={isBlocked}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});