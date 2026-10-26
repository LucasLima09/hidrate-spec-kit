import type { ReactElement } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { IconButton } from '@/components/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import type { IntakeEntry } from '@/domain/entities';
import { useTheme } from '@/hooks/use-theme';
import { formatVolume } from '@/utils/volume';

interface IntakeHistoryListProps {
  entries: IntakeEntry[];
  onEdit: (entry: IntakeEntry) => void;
  onRemove: (entry: IntakeEntry) => void;
  header?: ReactElement;
  disabled?: boolean;
}

export function IntakeHistoryList({
  entries,
  onEdit,
  onRemove,
  header,
  disabled = false,
}: IntakeHistoryListProps) {
  const theme = useTheme();
  const ordered = [...entries].sort(
    (first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)
  );

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={ordered}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <EmptyState
          message="Adicione água pelos atalhos ou informe um volume personalizado."
          title="Nenhum registro hoje"
        />
      }
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View
          accessibilityLabel={`Registro das ${item.localTime}: ${item.volumeMl} mililitros`}
          style={[
            styles.item,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: theme.backgroundElement }]}>
            <Icon color={theme.accent} name="droplet" size={18} />
          </View>
          <View style={styles.itemInfo}>
            <ThemedText type="smallBold" style={styles.volume}>
              {formatVolume(item.volumeMl)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Registro das {item.localTime}
            </ThemedText>
          </View>
          <View style={styles.itemActions}>
            <IconButton
              accessibilityLabel={`Editar registro das ${item.localTime}`}
              disabled={disabled}
              icon="edit"
              onPress={() => onEdit(item)}
            />
            <IconButton
              accessibilityLabel={`Remover registro das ${item.localTime}`}
              disabled={disabled}
              icon="trash"
              onPress={() => onRemove(item)}
              tone="danger"
            />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  item: {
    alignItems: 'center',
    borderRadius: Radius.large,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  itemInfo: {
    flex: 1,
    gap: 1,
  },
  volume: {
    fontSize: 16,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
