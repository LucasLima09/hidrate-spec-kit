import { Modal, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: destructive ? theme.dangerSoft : theme.accentSoft },
            ]}>
            <Icon
              color={destructive ? theme.danger : theme.accent}
              name={destructive ? 'trash' : 'check'}
              size={20}
            />
          </View>
          <View style={styles.header}>
            <ThemedText type="subtitle">{title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {message}
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <AppButton
              disabled={false}
              label={cancelLabel}
              onPress={onCancel}
              style={styles.action}
              variant="ghost"
            />
            <AppButton
              label={confirmLabel}
              onPress={onConfirm}
              style={styles.action}
              variant={destructive ? 'danger' : 'primary'}
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
