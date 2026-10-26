import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  editable?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  editable = true,
  accessibilityLabel,
  testID,
}: FormFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? theme.danger : focused ? theme.accent : theme.border;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        inputMode="numeric"
        keyboardType="number-pad"
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        style={[
          styles.input,
          {
            backgroundColor: editable ? theme.surfaceMuted : theme.backgroundElement,
            borderColor,
            color: theme.text,
          },
        ]}
        testID={testID}
        value={value}
      />
      {error ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: theme.danger }]}
          type="small">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  input: {
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    minHeight: 54,
    paddingHorizontal: Spacing.three,
  },
  error: {
    fontWeight: 600,
  },
});
