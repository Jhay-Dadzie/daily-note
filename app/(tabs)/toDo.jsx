import { StyleSheet, Text, View } from 'react-native';
import CheckBox from 'expo-checkbox';

import EntryList from '@/components/EntryList';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/components/constants/themeColor';

const SORT_OPTIONS = [
  { key: 'pending', label: 'Unfinished first', icon: 'square-o' },
  { key: 'newest', label: 'Newest first', icon: 'arrow-down' },
  { key: 'oldest', label: 'Oldest first', icon: 'arrow-up' },
  { key: 'title', label: 'Title (A–Z)', icon: 'sort-alpha-asc' },
];

/** Tick box rendered to the left of a to-do's title. */
function TodoCheckbox({ item, update, haptics }) {
  const { theme } = useTheme();

  return (
    <CheckBox
      value={Boolean(item.isChecked)}
      color={item.isChecked ? theme.accent : theme.muted}
      onValueChange={next => {
        haptics.toggle();
        update(item.id, { isChecked: next });
      }}
      style={styles.checkbox}
    />
  );
}

function CompletedBadge() {
  const { theme, typography } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: theme.surfaceAlt }]}>
      <Text style={[typography.meta, { color: theme.success }]}>Completed</Text>
    </View>
  );
}

export default function TodoScreen() {
  return (
    <EntryList
      storageKey="todos"
      detailRoute="/dynamics/todoRoute"
      createHref="/createToDo"
      createLabel="New to-do"
      searchPlaceholder="Search to-dos"
      sortOptions={SORT_OPTIONS}
      emptyImage={require('../../assets/check.png')}
      emptyTitle="Nothing to do"
      emptySubtitle="Add a task and tick it off when it's done."
      deletedMessage="To-do deleted"
      bodyLines={2}
      isDimmed={item => Boolean(item.isChecked)}
      isStruck={item => Boolean(item.isChecked)}
      renderLeading={(item, { update, haptics }) => (
        <TodoCheckbox item={item} update={update} haptics={haptics} />
      )}
      renderFooter={item => (item.isChecked ? <CompletedBadge /> : null)}
    />
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm / 2,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
