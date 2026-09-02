import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import EntryEditor from '@/components/EntryEditor';
import { findEntry, updateEntry } from '@/hooks/useEntries';

export default function NoteDetailScreen() {
  const { notesId } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [spans, setSpans] = useState([]);
  const [editable, setEditable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    findEntry('notes', notesId).then(note => {
      if (cancelled || !note) return;
      setTitle(note.title ?? '');
      setBody(note.body ?? '');
      setSpans(note.spans ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, [notesId]);

  const save = async () => {
    if (!body.trim() && !title.trim()) {
      Alert.alert('Nothing to save', 'The note would be empty.');
      return;
    }

    await updateEntry('notes', notesId, {
      title: title.trim() || 'Untitled note',
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
      titlePlaceholder="Note title"
      bodyPlaceholder="Start writing…"
      editable={editable}
      onToggleEditable={() => setEditable(previous => !previous)}
      onSave={save}
      saveLabel="Update"
    />
  );
}
