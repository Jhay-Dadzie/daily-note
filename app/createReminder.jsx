import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import ReminderPicker from '@/components/ui/ReminderPicker';
import { appendEntry } from '@/hooks/useEntries';
import { PushNotification } from '@/components/pushNotification';

export default function CreateReminderScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);
  const [alarm, setAlarm] = useState(null);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'Write your reminder first.');
      return;
    }

    if (!alarm || alarm.getTime() <= Date.now()) {
      Alert.alert('When should we remind you?', 'Pick a future date and time.');
      return;
    }

    const resolvedTitle = title.trim() || 'Untitled reminder';

    const notificationId = await PushNotification.schedule({
      id: Date.now(),
      title: resolvedTitle,
      body: body.trim(),
      schedule: alarm,
    });

    if (!notificationId) {
      Alert.alert(
        'Could not schedule',
        'Check that notifications are allowed for Daily Note, then try again.'
      );
      return;
    }

    await appendEntry('reminders', {
      title: resolvedTitle,
      // Not trimmed: span offsets are indexes into this exact string.
      body,
      spans,
      schedule: alarm.getTime(),
      notificationId,
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
      onSave={save}
      saveLabel="Save"
      header={<ReminderPicker value={alarm} onChange={setAlarm} />}
    />
  );
}
