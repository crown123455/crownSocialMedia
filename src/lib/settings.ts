import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

const LOCAL_SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');

export async function getSetting(key: string): Promise<string | undefined> {
  // 1. Try Supabase system_settings table
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single();
      
    if (!error && data && data.value) {
      return data.value;
    }
  } catch (err) {
    // Table might not exist yet, fall back to local/env
  }

  // 2. Try local file data/settings.json
  try {
    if (fs.existsSync(LOCAL_SETTINGS_PATH)) {
      const fileContent = fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8');
      const settings = JSON.parse(fileContent);
      if (settings[key] && settings[key] !== `YOUR_${key}_HERE`) {
        return settings[key];
      }
    }
  } catch (err) {
    console.error('Error reading local settings file:', err);
  }

  // 3. Try process.env
  const envVal = process.env[key];
  if (envVal && envVal !== `YOUR_${key}_HERE`) {
    return envVal;
  }
  
  return undefined;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const keys = [
    'META_CLIENT_ID', 'META_CLIENT_SECRET', 'META_REDIRECT_URI',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI',
    'TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_ID', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'
  ];

  for (const k of keys) {
    const val = await getSetting(k);
    if (val) result[k] = val;
  }
  return result;
}

export async function saveSettings(newSettings: Record<string, string>): Promise<{ supabaseSuccess: boolean, localSuccess: boolean, error?: string }> {
  let supabaseSuccess = false;
  let localSuccess = false;
  let errorMessage: string | undefined;

  // 1. Save to local filesystem first (guaranteed to work locally)
  try {
    const dir = path.dirname(LOCAL_SETTINGS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    let existing: Record<string, string> = {};
    if (fs.existsSync(LOCAL_SETTINGS_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8'));
      } catch (e) {}
    }

    const merged = { ...existing, ...newSettings };
    fs.writeFileSync(LOCAL_SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');
    localSuccess = true;
  } catch (err: any) {
    console.error('Failed to save settings locally:', err);
    errorMessage = err.message;
  }

  // 2. Save to Supabase system_settings table
  try {
    const rows = Object.entries(newSettings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('system_settings')
      .upsert(rows, { onConflict: 'key' });

    if (!error) {
      supabaseSuccess = true;
    } else {
      console.warn('Supabase system_settings upsert error:', error.message);
      if (!errorMessage) errorMessage = error.message;
    }
  } catch (err: any) {
    console.warn('Supabase system_settings table might not exist:', err);
    if (!errorMessage) errorMessage = err.message;
  }

  return { supabaseSuccess, localSuccess, error: errorMessage };
}
