import { json } from '@vercel/platform';

export default async function handler(req, res) {
  const data = await import('../db.json');
  const books = data.books;
  return json(books);
}