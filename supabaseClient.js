import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'shootingks_data';
const MIGRATION_FLAG = 'shootingks_supabase_migrated';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export const getSupabaseClient = () => {
  if (!supabaseInstance && isSupabaseConfigured()) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
};

const loadLocalData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read local data for migration', error);
    return {};
  }
};

const saveLocalData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save local data for migration', error);
  }
};

const getTableName = (entityName) => {
  const normalized = String(entityName)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
  return normalized.endsWith('s') ? normalized : `${normalized}s`;
};

const getRecordId = (record) => record?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeRecord = (record) => {
  if (!record || typeof record !== 'object') return record;
  const normalized = { ...record };
  if (!normalized.id) {
    normalized.id = getRecordId(normalized);
  }
  return normalized;
};

export const migrateLocalDataToSupabase = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  if (localStorage.getItem(MIGRATION_FLAG) === 'true') return false;

  const localData = loadLocalData();
  const entityNames = Object.keys(localData || {});
  if (!entityNames.length) {
    localStorage.setItem(MIGRATION_FLAG, 'true');
    return false;
  }

  try {
    for (const entityName of entityNames) {
      const items = Array.isArray(localData[entityName]) ? localData[entityName] : [];
      for (const item of items) {
        const normalized = normalizeRecord(item);
        await supabase.from('app_data').upsert({
          entity_name: entityName,
          record_id: normalized.id,
          data: normalized,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'entity_name,record_id' });
      }
    }
    localStorage.setItem(MIGRATION_FLAG, 'true');
    return true;
  } catch (error) {
    console.error('Supabase migration failed', error);
    return false;
  }
};

export const createSupabaseEntityApi = (entityName) => {
  const tableName = 'app_data';

  const list = async (orderBy, limit) => {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('entity_name', entityName)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    let items = (data || []).map((row) => row.data).filter(Boolean);
    if (orderBy) {
      const direction = orderBy.startsWith('-') ? -1 : 1;
      const field = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      items = [...items].sort((a, b) => {
        const left = a?.[field];
        const right = b?.[field];
        if (left === right) return 0;
        if (left == null) return 1;
        if (right == null) return -1;
        return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction;
      });
    }
    if (typeof limit === 'number') {
      items = items.slice(0, limit);
    }
    return items;
  };

  const filter = async (filterObj, orderBy, limit) => {
    const items = await list(orderBy, limit);
    if (!filterObj) return items;
    return items.filter((item) => Object.entries(filterObj).every(([key, value]) => item?.[key] === value));
  };

  const create = async (record) => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const normalized = normalizeRecord(record);
    const { data, error } = await supabase
      .from(tableName)
      .insert({
        entity_name: entityName,
        record_id: normalized.id,
        data: normalized,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data?.data || normalized;
  };

  const update = async (id, updates) => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data: existingRow, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('entity_name', entityName)
      .eq('record_id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingRow) throw new Error(`Record not found: ${entityName} ${id}`);

    const updatedData = { ...(existingRow.data || {}), ...(updates || {}), id, updated_date: new Date().toISOString() };
    const { data, error } = await supabase
      .from(tableName)
      .update({ data: updatedData, updated_at: new Date().toISOString() })
      .eq('id', existingRow.id)
      .select('*')
      .single();

    if (error) throw error;
    return data?.data || updatedData;
  };

  const remove = async (id) => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data: existingRow, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('entity_name', entityName)
      .eq('record_id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingRow) throw new Error(`Record not found: ${entityName} ${id}`);

    const { error } = await supabase.from(tableName).delete().eq('id', existingRow.id);
    if (error) throw error;
    return existingRow.data || null;
  };

  return { list, filter, create, update, delete: remove };
};

export const supabaseEntityProxy = new Proxy({}, {
  get(_target, entityName) {
    const key = String(entityName);
    if (!this[key]) {
      this[key] = createSupabaseEntityApi(key);
    }
    return this[key];
  },
});
