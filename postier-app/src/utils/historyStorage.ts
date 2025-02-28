import { exists, createDir, writeTextFile, readTextFile, removeFile } from '@tauri-apps/api/fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { RequestHistoryItem } from '../types';

// File name for storing history
const HISTORY_FILE = 'history.json';

/**
 * Get the app data directory path
 */
async function getAppDataDir(): Promise<string> {
  // Get the app data directory path
  const appDir = await appDataDir();
  
  // Create the postier directory if it doesn't exist
  const postierDir = await join(appDir, 'postier');
  try {
    await createDir(postierDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directory:', error);
  }
  
  return postierDir;
}

/**
 * Get the full path to the history file
 */
async function getHistoryFilePath(): Promise<string> {
  const appDataDir = await getAppDataDir();
  return await join(appDataDir, HISTORY_FILE);
}

/**
 * Save history to file
 */
export async function saveHistory(history: RequestHistoryItem[]): Promise<void> {
  try {
    const filePath = await getHistoryFilePath();
    await writeTextFile(filePath, JSON.stringify(history, null, 2));
    console.log('History saved successfully');
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

/**
 * Load history from file
 */
export async function loadHistory(): Promise<RequestHistoryItem[]> {
  try {
    const filePath = await getHistoryFilePath();
    
    // Check if file exists
    const fileExists = await exists(filePath);
    if (!fileExists) {
      console.log('History file does not exist yet');
      return [];
    }
    
    // Read and parse the file
    const content = await readTextFile(filePath);
    return JSON.parse(content) as RequestHistoryItem[];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Clear history file
 */
export async function clearHistory(): Promise<void> {
  try {
    const filePath = await getHistoryFilePath();
    const fileExists = await exists(filePath);
    
    if (fileExists) {
      await removeFile(filePath);
      console.log('History cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing history:', error);
  }
} 