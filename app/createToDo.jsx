import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import { appendEntry } from '@/hooks/useEntries';

export default function CreateTodoScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'Describe the task first.');
      return;
    }

    await appendEntry('todos', {
      title: title.trim() || 'Untitled task',
      // Not trimmed: span offsets are indexes into this exact string.
      body,
      spans,
      isChecked: false,
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
      titlePlaceholder="What needs doing?"
      bodyPlaceholder="Add any details…"
      onSave={save}
      saveLabel="Save"
      autoFocus
    />
  );
}
