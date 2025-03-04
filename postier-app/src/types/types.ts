export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
export const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];

export type ContentType = 'form-data' | 'text' | 'javascript' | 'json' | 'html' | 'xml' | 'none';

export type ViewMode = 'raw' | 'preview' | 'pretty';

export interface KeyValue {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  id: string;
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  body: string;
  contentType: ContentType;
}

export interface RequestDataWithQuery extends RequestData {
  query: KeyValue[];
}

export interface RequestDataWithResponse extends RequestDataWithQuery {
  response: ResponseData | null;
  debug: KeyValue[] | null;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: KeyValue[] | null;
  data: string | null;
  time: number;
  size: number;
  id: string | null;
  debug: KeyValue[] | null;
}

export interface RequestHistoryItem extends RequestData {
  timestamp: number;
  response?: ResponseData;
} 