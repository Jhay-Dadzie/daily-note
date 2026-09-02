import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import ReminderPicker from '@/components/ui/ReminderPicker';
import { findEntry, updateEntry } from '@/hooks/useEntries';
import { PushNotification } from '@/components/pushNotification';

export default function ReminderDetailScreen() {
  const { remindersId } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);
  const [alarm, setAlarm] = useState(null);
  const [editable, setEditable] = useState(false);

  /** The notification currently scheduled for this reminder, if any. */
  const notificationId = useRef(null);

  useEffect(() => {
    let cancelled = false;

    findEntry('reminders', remindersId).then(reminder => {
      if (cancelled || !reminder) return;
      setTitle(reminder.title ?? '');
      setBody(reminder.body ?? '');
      setSpans(reminder.spans ?? []);
      setAlarm(reminder.schedule ? new Date(reminder.schedule) : null);
      notificationId.current = reminder.notificationId ?? null;
    });

    return () => {
      cancelled = true;
    };
  }, [remindersId]);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'The reminder would be empty.');
      return;
    }

    if (!alarm || alarm.getTime() <= Date.now()) {
      Alert.alert('When should we remind you?', 'Pick a future date and time.');
      return;
    }

    const resolvedTitle = title.trim() || 'Untitled reminder';

    // Replace rather than mutate: the old notification has to be cancelled
    // before a new one is scheduled, otherwise it fires at the previous time.
    await PushNotification.cancel(notificationId.current);

    const nextNotificationId = await PushNotification.schedule({
      id: remindersId,
      title: resolvedTitle,
      body: body.trim(),
      schedule: alarm,
    });

    if (!nextNotificationId) {
      Alert.alert(
        'Could not schedule',
        'Check that notifications are allowed for Daily Note, then try again.'
      );
      return;
    }

    notificationId.current = nextNotificationId;

    await updateEntry('reminders', remindersId, {
      title: resolvedTitle,
      // Not trimmed: span offsets are indexes into this exact string.
      body,
      spans,
      schedule: alarm.getTime(),
      notificationId: nextNotificationId,
    });

    router.back();
  };

  return (
    <EntryEditor
      titleValue={title}
      onChangeTitle={setTitle}
      bodyValue={body}
      onChangeBody={setBody}
      spansValue={spans}
      onChangeSpans={setSpans}
      titlePlaceholder="Reminder title"
      bodyPlaceholder="What should we remind you about?"
      editable={editable}
      onToggleEditable={() => setEditable(previous => !previous)}
      onSave={save}
      saveLabel="Update"
      header={
        <ReminderPicker value={alarm} onChange={setAlarm} editable={editable} />
      }
    />
  );
}
