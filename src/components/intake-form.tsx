import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { FormField } from '@/components/form-field';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { parseVolumeInput } from '@/utils/validation';

interface IntakeFormProps {
  onSubmit: (volumeMl: number) => Promise<boolean>;
  disabled?: boolean;
}

export function IntakeForm({ onSubmit, disabled = false }: IntakeFormProps) {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseVolumeInput(value);
    if (!parsed.ok) {
      setError(parsed.error.message);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const success = await onSubmit(parsed.value);
      if (success) {
        setValue('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = disabled || submitting;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
          <Icon color={theme.accentDark} name="dropletOutline" size={18} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="smallBold">Registrar outro volume</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Informe a quantidade que você bebeu.
          </ThemedText>
        </View>
      </View>

      <FormField
        accessibilityLabel="Volume personalizado em mililitros"
        editable={!isDisabled}
        error={error}
        label="Volume personalizado (ml)"
        onChangeText={(next) => {
          setValue(next);
          if (error) {
            setError(null);
          }
        }}
        placeholder="Ex.: 300"
        testID="intake-volume-input"
        value={value}
      />

      <AppButton
        accessibilityLabel="Adicionar volume personalizado"
        disabled={isDisabled}
        icon="addCircle"
        label="Adicionar"
        onPress={() => {
          void handleSubmit();
        }}
      />

      <ThemedText type="small" themeColor="textTertiary" style={styles.helper}>
        O volume deve ser um número inteiro entre 1 e 5.000 ml.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  helper: {
    lineHeight: 17,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.medium,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
