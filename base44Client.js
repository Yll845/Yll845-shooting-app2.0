import { createSupabaseEntityApi, isSupabaseConfigured, migrateLocalDataToSupabase } from '@/api/supabaseClient';

const STORAGE_KEY = 'shootingks_data';
const AUTH_USER_KEY = 'shootingks_user';

const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read local data', error);
    return {};
  }
};

const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save local data', error);
  }
};

const createId = (prefix) => `${prefix || 'item'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeOrder = (orderBy) => {
  if (!orderBy) return null;
  const direction = orderBy.startsWith('-') ? -1 : 1;
  const field = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
  return { field, direction };
};

const compare = (a, b) => {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
};

const sortItems = (items, orderBy) => {
  const order = normalizeOrder(orderBy);
  if (!order) return items;
  return [...items].sort((a, b) => compare(a[order.field], b[order.field]) * order.direction);
};

const matchesFilter = (item, filter) => {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => item[key] === value);
};

const getEntityStore = (entityName) => {
  const data = loadData();
  if (!data[entityName]) data[entityName] = [];
  return data;
};

const writeEntityStore = (entityName, list) => {
  const data = loadData();
  data[entityName] = list;
  saveData(data);
};

const createEntityApi = (entityName) => ({
  list: async (orderBy, limit) => {
    if (isSupabaseConfigured()) {
      return createSupabaseEntityApi(entityName).list(orderBy, limit);
    }

    const data = getEntityStore(entityName)[entityName];
    let items = sortItems(data, orderBy);
    if (typeof limit === 'number') {
      items = items.slice(0, limit);
    }
    return items;
  },

  filter: async (filter, orderBy, limit) => {
    if (isSupabaseConfigured()) {
      return createSupabaseEntityApi(entityName).filter(filter, orderBy, limit);
    }

    const data = getEntityStore(entityName)[entityName];
    let items = data.filter((item) => matchesFilter(item, filter));
    items = sortItems(items, orderBy);
    if (typeof limit === 'number') {
      items = items.slice(0, limit);
    }
    return items;
  },

  create: async (record) => {
    if (isSupabaseConfigured()) {
      return createSupabaseEntityApi(entityName).create(record);
    }

    const data = getEntityStore(entityName);
    const list = data[entityName];
    const now = new Date().toISOString();
    const id = record.id || createId(entityName);
    const newRecord = {
      id,
      created_date: record.created_date || now,
      updated_date: now,
      ...record
    };
    list.push(newRecord);
    writeEntityStore(entityName, list);
    return newRecord;
  },

  update: async (id, updates) => {
    if (isSupabaseConfigured()) {
      return createSupabaseEntityApi(entityName).update(id, updates);
    }

    const data = getEntityStore(entityName);
    const list = data[entityName];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found: ${entityName} ${id}`);
    }
    const updated = { ...list[index], ...updates, updated_date: new Date().toISOString() };
    list[index] = updated;
    writeEntityStore(entityName, list);
    return updated;
  },

  delete: async (id) => {
    if (isSupabaseConfigured()) {
      return createSupabaseEntityApi(entityName).delete(id);
    }

    const data = getEntityStore(entityName);
    const list = data[entityName];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found: ${entityName} ${id}`);
    }
    const [deleted] = list.splice(index, 1);
    writeEntityStore(entityName, list);
    return deleted;
  }
});

const entities = new Proxy({}, {
  get(target, entityName) {
    if (!(entityName in target)) {
      target[entityName] = createEntityApi(entityName);
    }
    return target[entityName];
  }
});

const defaultUser = {
  id: 'local-admin',
  name: 'Administrator',
  email: 'admin@example.com',
  role: 'admin'
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to load stored user', error);
    return null;
  }
};

if (isSupabaseConfigured()) {
  migrateLocalDataToSupabase();
}

export const base44 = {
  entities,
  auth: {
    me: async () => getStoredUser() || defaultUser,
    logout: async () => {
      localStorage.removeItem(AUTH_USER_KEY);
      return true;
    },
    redirectToLogin: async () => {
      window.location.reload();
    }
  }
};
