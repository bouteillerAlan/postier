import {writeFile, BaseDirectory, readFile, mkdir, exists} from '@tauri-apps/plugin-fs';

/**
 * create the base directory for the app
 * @return Promise<void>
 */
async function createAppFolderIfNotExist(): Promise<void> {
  const configExist = await exists('.', { baseDir: BaseDirectory.AppConfig });
  const localDataExist = await exists('.', { baseDir: BaseDirectory.AppLocalData });
  if (!configExist) await mkdir('', { baseDir: BaseDirectory.AppConfig });
  if (!localDataExist) await mkdir('', { baseDir: BaseDirectory.AppLocalData });
}

/**
 * write the data in the file
 * /!\ if the file doesn't exist the file is created
 * /!\ if  the file exist the file is overwritten
 * @param data string the data you want to write in the file
 * @param file 'config.json' | 'history.json' name of the file with extension
 */
export async function writeContentInFile(data: string, file: 'config.txt' | 'history.txt'): Promise<boolean> {
  const encoder: TextEncoder = new TextEncoder();
  const dataUint: Uint8Array = encoder.encode(data);

  try {
    await createAppFolderIfNotExist();
    if (file === 'config.txt') {
      await writeFile(file, dataUint, {baseDir: BaseDirectory.AppConfig});
    } else {
      await writeFile(file, dataUint, {baseDir: BaseDirectory.AppLocalData});
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * read the content of file and return it
 * @param file 'config.json' | 'history.json' name of the file with extension
 * @return string
 */
export async function getContentFromFile(file: 'config.txt' | 'history.txt'): Promise<string> {
  const decoder: TextDecoder = new TextDecoder();

  try {
    if (file === 'config.txt') {
      const data: Uint8Array = await readFile(file, {baseDir: BaseDirectory.AppConfig});
      return decoder.decode(data);
    } else {
      const data: Uint8Array = await readFile(file, {baseDir: BaseDirectory.AppLocalData});
      return decoder.decode(data);
    }
  } catch (e) {
    console.log(e);
    return '';
  }
}
