// Shared types. Real projects usually keep the API types in one file like this (types.ts / api/types.ts).
// They MUST match the JSON the backend sends (same field names!).

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  read: boolean;
}

// The body we SEND to create a book: everything except id, and `read` is optional.
// Omit<T, K> = "type T without key K". Partial<T> = "all keys of T optional".
export type NewBook = Omit<Book, "id" | "read"> & { read?: boolean };

// A union of string literals: the value can ONLY be one of these. Great for statuses/filters.
export type Filter = "all" | "read" | "unread";
