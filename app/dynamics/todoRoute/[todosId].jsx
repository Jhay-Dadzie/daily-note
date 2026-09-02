import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import { findEntry, updateEntry } from '@/hooks/useEntries';

export default function TodoDetailScreen() {
  const { todosId } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    findEntry('todos', todosId).then(todo => {
      if (cancelled || !todo) return;
      setTitle(todo.title ?? '');
      setBody(todo.body ?? '');
      setSpans(todo.spans ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, [todosId]);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'The to-do would be empty.');
      return;
    }

    await updateEntry('todos', todosId, {
      title: title.trim() || 'Untitled task',
      // Not trimmed: span offsets are indexes into this exact string.
      body,
      spans,
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
      editable={editable}
      onToggleEditable={() => setEditable(previous => !previous)}
      onSave={save}
      saveLabel="Update"
    />
  );
}
