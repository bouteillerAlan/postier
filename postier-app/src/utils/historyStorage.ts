import { 
  exists, 
  mkdir, 
  writeTextFile, 
  readTextFile, 
  remove,
  BaseDirectory 
} from '@tauri-apps/plugin-fs';
import { RequestHistoryItem } from '../types';

const HISTORY_FILE_NAME = 'history.json';
const HISTORY_DIR = ''; // Empty string means root of the AppLocalData directory

/**
 * Ensures the app data directory exists
 */
async function ensureAppDataDir(): Promise<void> {
  try {
    const dirExists = await exists(HISTORY_DIR, { baseDir: BaseDirectory.AppLocalData });
    
    if (!dirExists) {
      await mkdir(HISTORY_DIR, { 
        baseDir: BaseDirectory.AppLocalData,
        recursive: true 
      });
    }
  } catch (error) {
    console.error('Failed to ensure app data directory exists:', error);
    throw error;
  }
}

/**
 * Saves request history to a file
 */
export async function saveHistoryToFile(history: RequestHistoryItem[]): Promise<void> {
  try {
    await ensureAppDataDir();
    
    await writeTextFile(HISTORY_FILE_NAME, JSON.stringify(history, null, 2), {
      baseDir: BaseDirectory.AppLocalData
    });
    
    console.log('History saved to file in AppLocalData directory');
  } catch (error) {
    console.error('Failed to save history to file:', error);
  }
}

/**
 * Loads request history from a file
 */
export async function loadHistoryFromFile(): Promise<RequestHistoryItem[]> {
  try {
    const fileExists = await exists(HISTORY_FILE_NAME, { 
      baseDir: BaseDirectory.AppLocalData 
    });
    
    if (!fileExists) {
      console.log('History file does not exist, returning empty array');
      return [];
    }
    
    const historyJson = await readTextFile(HISTORY_FILE_NAME, {
      baseDir: BaseDirectory.AppLocalData
    });
    
    const history = JSON.parse(historyJson) as RequestHistoryItem[];
    console.log('History loaded from file in AppLocalData directory');
    return history;
  } catch (error) {
    console.error('Failed to load history from file:', error);
    return [];
  }
}

/**
 * Clears the history file
 */
export async function clearHistoryFile(): Promise<void> {
  try {
    const fileExists = await exists(HISTORY_FILE_NAME, { 
      baseDir: BaseDirectory.AppLocalData 
    });
    
    if (fileExists) {
      await remove(HISTORY_FILE_NAME, {
        baseDir: BaseDirectory.AppLocalData
      });
      console.log('History file cleared');
    }
  } catch (error) {
    console.error('Failed to clear history file:', error);
  }
}
