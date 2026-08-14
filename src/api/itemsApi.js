import axios from 'axios';
// process.env.REACT_APP_API_URL ||
const API_BASE =  'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE });

// MongoDB documents come back with `_id`, not `id` — normalizing here once
// means every component downstream can just use `item.id` and never has to
// know or care that Mongo is involved. This is a common first bug in MERN
// projects (React keys/edit-lookups silently failing because `id` is undefined).
function normalize(item) {
  if (!item) return item;
  return { ...item, id: item.id || item._id };
}

export const fetchItems = () =>
  client.get('/items').then((res) => res.data.map(normalize));

export const createItem = (item) =>
  client.post('/items', item).then((res) => normalize(res.data));

export const updateItem = (id, item) =>
  client.put(`/items/${id}`, item).then((res) => normalize(res.data));

export const deleteItem = (id) =>
  client.delete(`/items/${id}`).then((res) => res.data);
