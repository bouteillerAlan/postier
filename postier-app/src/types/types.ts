export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
export const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];

export type ContentType = 'form-data' | 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'none';

export type ViewMode = 'raw' | 'preview' | 'pretty';

export type hlTheme = 'dracula' | 'duotoneDark' | 'duotoneLight' | 'github' | 'gruvboxMaterialDark' | 'gruvboxMaterialLight' | 'jettwaveDark' | 'jettwaveLight' | 'nightOwl' | 'nightOwlLight' | 'oceanicNext' | 'okaidia' | 'oneDark' | 'oneLight' | 'palenight' | 'shadesOfPurple' | 'synthwave84' | 'ultramin' | 'vsDark' | 'vsLight';
export const hlThemes: hlTheme[] = ['dracula', 'duotoneDark', 'duotoneLight', 'github', 'gruvboxMaterialDark', 'gruvboxMaterialLight', 'jettwaveDark', 'jettwaveLight', 'nightOwl', 'nightOwlLight', 'oceanicNext', 'okaidia', 'oneDark', 'oneLight', 'palenight', 'shadesOfPurple', 'synthwave84', 'ultramin', 'vsDark', 'vsLight'];

export type gTheme = 'light' | 'dark' | 'auto';
export const gThemes: gTheme[] = ['light', 'dark', 'auto'];

export type accentTheme = 'gray' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber' | 'orange' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime' | 'mint' | 'sky';
export const accentThemes: accentTheme[] = ['gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass', 'lime', 'mint', 'sky'];

export type scaleTheme = '90%' | '95%' | '100%' | '105%' | '110%';
export const scaleThemes: scaleTheme[] = ['90%', '95%', '100%', '105%', '110%'];

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  id: string;
  timestamp: number;
  url: string;
  composedUrl: string;
  method: HttpMethod;
  headers: KeyValue[] | null;
  query: KeyValue[] | null;
  contentType: ContentType | null;
  body: string | null;
}

export interface ResponseData {
  id: string;
  timestamp: number;
  status: number;
  statusText: string;
  headers: KeyValue[] | null;
  data: string | null;
  time: number;
  size: number;
}

export interface PostierObject {
  request: RequestData;
  response: ResponseData;
  debug: KeyValue[];
}

export type UserSettingKeys = 'globalTheme' | 'codeTheme' | 'debug' | 'accentTheme' | 'scaleTheme';
export interface UserSetting {
  globalTheme: 'light' | 'dark' | 'auto';
  accentTheme: accentTheme;
  scaleTheme: scaleTheme;
  codeTheme: hlTheme;
  debug: boolean;
}

export interface Alert {
  title: string;
  message: string;
  show: boolean;
}