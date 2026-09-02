import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useTheme } from '@/context/ThemeContext';
import { spacing } from '@/components/constants/themeColor';
import { useEntries } from '@/hooks/useEntries';
import { useHaptics } from '@/hooks/useHaptics';
import { useMotion } from '@/hooks/useMotion';
import EntryCard from '@/components/EntryCard';
import EmptyState from '@/components/ui/EmptyState';
import Fab from '@/components/ui/Fab';
import SearchBar from '@/components/ui/SearchBar';
import SelectionBar from '@/components/ui/SelectionBar';
import Snackbar from '@/components/ui/Snackbar';
import SortSheet from '@/components/ui/SortSheet';
import SwipeableRow from '@/components/ui/SwipeableRow';

/**
 * The list screen shared by all three tabs.
 *
 * Notes, to-dos and reminders previously duplicated ~160 lines each of
 * identical load / delete / render / empty-state logic. The only genuine
 * differences are the copy, the sort orders and two optional render slots, so
 * those are props and everything else lives here once.
 */
export default function EntryList({
  storageKey,
  detailRoute,
  createHref,
  createLabel,
  searchPlaceholder,
  sortOptions,
  emptyImage,
  emptyTitle,
  emptySubtitle,
  deletedMessage,
  bodyLines,
  renderLeading,
  renderFooter,
  isDimmed,
  isStruck,
  onRemove,
  onRestore,
}) {
  const { theme } = useTheme();
  const router = useRouter();
  const haptics = useHaptics();
  const motion = useMotion();

  const {
    visible,
    entries,
    query,
    setQuery,
    sort,
    setSort,
    removeMany,
    undoRemove,
    update,
    togglePin,
    setPinnedMany,
  } = useEntries(storageKey, {
    onRemove,
    onRestore,
    // Each list's first sort option is its natural default.
    initialSort: sortOptions[0].key,
  });

  const [sortVisible, setSortVisible] = useState(false);
  /** `{ message, undoable }` — only deletions can be undone. */
  const [snack, setSnack] = useState(null);
  const [fabHidden, setFabHidden] = useState(false);
  /** Ids picked out in multi-select mode. Empty set = normal browsing. */
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const lastOffset = useRef(0);
  const selectionMode = selectedIds.size > 0;

  const exitSelection = useCallback(() => setSelectedIds(new Set()), []);
  // Stable, so the Snackbar's auto-dismiss timer is not reset every render.
  const dismissSnack = useCallback(() => setSnack(null), []);

  // Android's back gesture should leave selection mode before leaving the tab.
  useFocusEffect(
    useCallback(() => {
      if (!selectionMode) return undefined;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        exitSelection();
        return true;
      });

      return () => subscription.remove();
    }, [exitSelection, selectionMode])
  );

  // Hide the FAB while scrolling down, bring it back on the way up. State only
  // changes when the direction actually flips, so this stays cheap.
  const onScroll = useCallback(event => {
    const offset = event.nativeEvent.contentOffset.y;
    const delta = offset - lastOffset.current;

    if (Math.abs(delta) > 8) {
      setFabHidden(delta > 0 && offset > 40);
      lastOffset.current = offset;
    }
  }, []);

  const handleDelete = useCallback(
    async ids => {
      haptics.warning();
      await removeMany(ids);
      exitSelection();
      setSnack({
        message: ids.length === 1 ? deletedMessage : `${ids.length} items deleted`,
        undoable: true,
      });
    },
    [deletedMessage, exitSelection, haptics, removeMany]
  );

  const handleUndo = useCallback(async () => {
    setSnack(null);
    await undoRemove();
    haptics.success();
  }, [haptics, undoRemove]);

  const handleTogglePin = useCallback(
    id => {
      haptics.toggle();
      togglePin(id);
    },
    [haptics, togglePin]
  );

  const toggleSelected = useCallback(id => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLongPress = useCallback(
    id => {
      haptics.toggle();
      toggleSelected(id);
    },
    [haptics, toggleSelected]
  );

  const handlePress = useCallback(
    id => {
      if (selectionMode) {
        haptics.select();
        toggleSelected(id);
        return;
      }
      haptics.tap();
      router.push(`${detailRoute}/${id}`);
    },
    [detailRoute, haptics, router, selectionMode, toggleSelected]
  );

  const selectedList = useMemo(() => [...selectedIds], [selectedIds]);

  const allSelectedPinned = useMemo(
    () =>
      selectedList.length > 0 &&
      selectedList.every(id => entries.find(entry => entry.id === id)?.pinned),
    [entries, selectedList]
  );

  const confirmBulkDelete = useCallback(() => {
    const count = selectedList.length;
    Alert.alert(
      `Delete ${count} ${count === 1 ? 'item' : 'items'}?`,
      'You can undo this straight after.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(selectedList),
        },
      ]
    );
  }, [handleDelete, selectedList]);

  const renderItem = useCallback(
    ({ item }) => {
      const card = (
        <EntryCard
          title={item.title}
          body={item.body}
          spans={item.spans}
          pinned={item.pinned}
          dimmed={isDimmed?.(item)}
          struck={isStruck?.(item)}
          bodyLines={bodyLines}
          selectionMode={selectionMode}
          selected={selectedIds.has(item.id)}
          leading={renderLeading?.(item, { update, haptics })}
          footer={renderFooter?.(item)}
          onPress={() => handlePress(item.id)}
          onLongPress={() => handleLongPress(item.id)}
        />
      );

      // Swiping would fight the selection gesture, so it is off while selecting.
      if (selectionMode) return card;

      return (
        <SwipeableRow
          pinned={item.pinned}
          onDelete={() => handleDelete([item.id])}
          onTogglePin={() => handleTogglePin(item.id)}
        >
          {card}
        </SwipeableRow>
      );
    },
    [
      bodyLines,
      handleDelete,
      handleLongPress,
      handlePress,
      handleTogglePin,
      haptics,
      isDimmed,
      isStruck,
      renderFooter,
      renderLeading,
      selectedIds,
      selectionMode,
      update,
    ]
  );

  const isEmpty = visible.length === 0;
  const searching = query.trim().length > 0;

  return (
    <SafeAreaView
      edges={['left', 'right']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      {selectionMode ? (
        <SelectionBar
          count={selectedIds.size}
          total={visible.length}
          allPinned={allSelectedPinned}
          onCancel={exitSelection}
          onSelectAll={() =>
            setSelectedIds(current =>
              current.size === visible.length
                ? new Set()
                : new Set(visible.map(entry => entry.id))
            )
          }
          onPin={async () => {
            const pinned = await setPinnedMany(selectedList);
            haptics.success();
            exitSelection();
            setSnack({
              message: `${selectedList.length} ${pinned ? 'pinned' : 'unpinned'}`,
              undoable: false,
            });
          }}
          onDelete={confirmBulkDelete}
        />
      ) : (
        // The search bar is pointless until there is something to search.
        entries.length > 0 && (
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={searchPlaceholder}
            onPressSort={() => setSortVisible(true)}
            sortActive={sort !== sortOptions[0].key}
          />
        )
      )}

      <Animated.FlatList
        data={visible}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        itemLayoutAnimation={motion.when(LinearTransition.springify().damping(18))}
        contentContainerStyle={[
          isEmpty && styles.emptyContent,
          !isEmpty && styles.listContent,
        ]}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            image={emptyImage}
            searching={searching}
            title={searching ? 'No matches' : emptyTitle}
            subtitle={
              searching ? `Nothing matches “${query.trim()}”` : emptySubtitle
            }
            actionLabel={createLabel}
            actionHref={createHref}
          />
        }
      />

      {!isEmpty && !selectionMode && (
        <Fab label={createLabel} href={createHref} hidden={fabHidden} />
      )}

      <SortSheet
        visible={sortVisible}
        options={sortOptions}
        value={sort}
        onSelect={setSort}
        onClose={() => setSortVisible(false)}
      />

      <Snackbar
        message={snack?.message}
        actionLabel="Undo"
        onAction={snack?.undoable ? handleUndo : undefined}
        onDismiss={dismissSnack}
      />
    </SafeAreaView>
  );
}

const Separator = () => <View style={{ height: spacing.sm }} />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
