/// <reference types="vite/client" />

// Declare Tauri API modules
declare module '@tauri-apps/api/fs' {
  export function exists(path: string): Promise<boolean>;
  export function createDir(path: string, options?: { recursive: boolean }): Promise<void>;
  export function writeTextFile(path: string, contents: string): Promise<void>;
  export function readTextFile(path: string): Promise<string>;
  export function removeFile(path: string): Promise<void>;
}

declare module '@tauri-apps/api/path' {
  export function appDataDir(): Promise<string>;
  export function join(...paths: string[]): Promise<string>;
}
