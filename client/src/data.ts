export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

export async function readEntries(): Promise<Entry[]> {
  const response = await fetch('/api/entries');
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const entries = await response.json();
  return entries;
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  const response = await fetch(`/api/entries/${entryId}`);
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const entry = await response.json();
  return entry;
}

export async function addEntry(entry: Entry): Promise<Entry> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const newEntry = await response.json();
  return newEntry;
}

export async function updateEntry(entry: Entry): Promise<Entry> {
  const response = await fetch(`/api/entries/${entry.entryId}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const updatedEntry = await response.json();
  return updatedEntry;
}

export async function removeEntry(entryId: number): Promise<void> {
  const response = await fetch(`/api/entries/${entryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
}
