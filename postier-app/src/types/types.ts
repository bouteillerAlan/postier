export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
export const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];

export type ContentType = 'form-data' | 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'none';

export type ViewMode = 'raw' | 'preview' | 'pretty';

export type hlTheme = 'dracula' | 'duotoneDark' | 'duotoneLight' | 'github' | 'gruvboxMaterialDark' | 'gruvboxMaterialLight' | 'jettwaveDark' | 'jettwaveLight' | 'nightOwl' | 'nightOwlLight' | 'oceanicNext' | 'okaidia' | 'oneDark' | 'oneLight' | 'palenight' | 'shadesOfPurple' | 'synthwave84' | 'ultramin' | 'vsDark' | 'vsLight';
export const hlThemes: hlTheme[] = ['dracula', 'duotoneDark', 'duotoneLight', 'github', 'gruvboxMaterialDark', 'gruvboxMaterialLight', 'jettwaveDark', 'jettwaveLight', 'nightOwl', 'nightOwlLight', 'oceanicNext', 'okaidia', 'oneDark', 'oneLight', 'palenight', 'shadesOfPurple', 'synthwave84', 'ultramin', 'vsDark', 'vsLight'];

export type gTheme = 'light' | 'dark' | 'auto';
export const gThemes: gTheme[] = ['light', 'dark', 'auto'];


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

export type UserSettingKeys = 'theme' | 'codeTheme';
export interface UserSetting {
  theme: 'light' | 'dark' | 'auto';
  codeTheme: hlTheme;
}
