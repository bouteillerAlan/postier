declare module '@tauri-apps/api' {
  export function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
} 