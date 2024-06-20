import { openDB } from 'idb';

const DB_NAME = 'keysDB';
const DB_VERSION = 1;
const STORE_NAME = 'keys';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'partner' });
      }
    },
  });
};

export const getKey = async (db, partner) => {
  return db.get(STORE_NAME, partner);
};

export const setKey = async (db, key) => {
  return db.put(STORE_NAME, key);
};

export const getAllKeys = async (db) => {
  return db.getAll(STORE_NAME);
};

export const clearDB = async (db) => {
  return db.clear(STORE_NAME);
};
