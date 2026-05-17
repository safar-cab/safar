import type { Book, CreateBookInput } from './types';

const BASE = '/books';

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create book');
  return res.json();
}

export async function deleteBook(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete book');
}
