import EntryList from '@/components/EntryList';

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest first', icon: 'arrow-down' },
  { key: 'oldest', label: 'Oldest first', icon: 'arrow-up' },
  { key: 'title', label: 'Title (A–Z)', icon: 'sort-alpha-asc' },
];

export default function NotesScreen() {
  return (
    <EntryList
      storageKey="notes"
      detailRoute="/dynamics/noteRoute"
      createHref="/createNote"
      createLabel="New note"
      searchPlaceholder="Search notes"
      sortOptions={SORT_OPTIONS}
      emptyImage={require('../../assets/writing.png')}
      emptyTitle="No notes yet"
      emptySubtitle="Anything you write down will show up here."
      deletedMessage="Note deleted"
      bodyLines={3}
    />
  );
}
