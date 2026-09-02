import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import { appendEntry } from '@/hooks/useEntries';

export default function CreateNoteScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'Write something first.');
      return;
    }

    await appendEntry('notes', {
      title: title.trim() || 'Untitled note',
      // Not trimmed: span offsets are indexes into this exact string.
      body,
      spans,
    });

    // The list reloads on focus, so going back is enough.
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
      titlePlaceholder="Note title"
      bodyPlaceholder="Start writing…"
      onSave={save}
      saveLabel="Save"
      autoFocus
    />
  );
}
