import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import EntryList from '@/components/EntryList';
import { useTheme } from '@/context/ThemeContext';
import { radius, spacing } from '@/components/constants/themeColor';
import { PushNotification } from '@/components/pushNotification';

const SORT_OPTIONS = [
  { key: 'schedule', label: 'Soonest first', icon: 'clock-o' },
  { key: 'newest', label: 'Recently added', icon: 'arrow-down' },
  { key: 'oldest', label: 'Oldest first', icon: 'arrow-up' },
  { key: 'title', label: 'Title (A–Z)', icon: 'sort-alpha-asc' },
];

/** Date chip under a reminder's body, flagged when the time has passed. */
function ScheduleChip({ schedule }) {
  const { theme, typography } = useTheme();
  // Sampled once on mount rather than read during every render, so the chip
  // stays a pure function of its props.
  const [now] = useState(() => Date.now());

  if (!schedule) {
    return (
      <View style={[styles.chip, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[typography.meta, { color: theme.muted }]}>No date set</Text>
      </View>
    );
  }

  const past = schedule <= now;
  const label = new Date(schedule).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: past ? theme.dangerSoft : theme.accentSoft },
      ]}
    >
      <Ionicons
        name={past ? 'alert-circle-outline' : 'alarm-outline'}
        size={13}
        color={past ? theme.danger : theme.accent}
      />
      <Text style={[typography.meta, { color: past ? theme.danger : theme.accent }]}>
        {past ? `Passed · ${label}` : label}
      </Text>
    </View>
  );
}

export default function RemindersScreen() {
  // Deleting a reminder must also cancel its pending notification, and undoing
  // that delete has to schedule a fresh one (the old id is gone for good).
  const cancelNotification = useCallback(
    entry => PushNotification.cancel(entry.notificationId),
    []
  );

  const rescheduleNotification = useCallback(async entry => {
    const notificationId = await PushNotification.schedule({
      ...entry,
      schedule: new Date(entry.schedule),
    });
    return { ...entry, notificationId };
  }, []);

  return (
    <EntryList
      storageKey="reminders"
      detailRoute="/dynamics/reminderRoute"
      createHref="/createReminder"
      createLabel="New reminder"
      searchPlaceholder="Search reminders"
      sortOptions={SORT_OPTIONS}
      emptyImage={require('../../assets/notification-bell.png')}
      emptyTitle="No reminders"
      emptySubtitle="Schedule one and we'll notify you at the right time."
      deletedMessage="Reminder deleted"
      bodyLines={2}
      renderFooter={item => <ScheduleChip schedule={item.schedule} />}
      onRemove={cancelNotification}
      onRestore={rescheduleNotification}
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});
