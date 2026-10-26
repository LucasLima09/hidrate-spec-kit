import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { FormField } from '@/components/form-field';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { IntakeEntry } from '@/domain/entities';
import { useTheme } from '@/hooks/use-theme';
import { parseVolumeInput } from '@/utils/validation';

interface IntakeEditDialogProps {
  entry: IntakeEntry | null;
  visible: boolean;
  saving?: boolean;
  onCancel: () => void;
  onSave: (entryId: string, volumeMl: number) => Promise<boolean>;
}

export function IntakeEditDialog({
  entry,
  visible,
  saving = false,
  onCancel,
  onSave,
}: IntakeEditDialogProps) {
  const theme = useTheme();
  const [value, setValue] = useState(() => (entry ? String(entry.volumeMl) : ''));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!entry) {
      return;
    }
    const parsed = parseVolumeInput(value);
    if (!parsed.ok) {
      setError(parsed.error.message);
      return;
    }
    setError(null);
    const success = await onSave(entry.id, parsed.value);
    if (success) {
      onCancel();
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
            <Icon color={theme.accent} name="edit" size={20} />
          </View>
          <View style={styles.header}>
            <ThemedText type="subtitle">Editar registro</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Horário original: {entry?.localTime}
            </ThemedText>
          </View>
          <FormField
            accessibilityLabel="Novo volume em mililitros"
            editable={!saving}
            error={error}
            label="Volume (ml)"
            onChangeText={(next) => {
              setValue(next);
              if (error) {
                setError(null);
              }
            }}
            testID="edit-volume-input"
            value={value}
          />
          <View style={styles.actions}>
            <AppButton
              accessibilityLabel="Cancelar edição"
              disabled={saving}
              label="Cancelar"
              onPress={onCancel}
              style={styles.action}
              variant="ghost"
            />
            <AppButton
              accessibilityLabel="Salvar novo volume"
              disabled={saving}
              icon="check"
              label={saving ? 'Salvando...' : 'Salvar'}
              onPress={() => {
                void handleSave();
              }}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  dialog: {
    borderRadius: Radius.xlarge,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
  action: {
    flexGrow: 1,
  },
});
