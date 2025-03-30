import {v4 as uuidv4} from 'uuid';
import {PostierObjectWithMetrics} from '../types/types.ts';

export function getRequestDefault(): PostierObjectWithMetrics {
  return {
    debug: [],
    request: {
      id: `r#${uuidv4()}`,
      timestamp: 0,
      url: '',
      composedUrl: '',
      method: 'GET',
      headers: null,
      query: null,
      contentType: null,
      body: null,
      identity: {
        tabId: `t#${uuidv4()}`,
      }
    },
    response: {
      id: '',
      timestamp: 0,
      status: 0,
      statusText: 'No request sent',
      headers: null,
      data: 'Send a request to see the response here.',
      time: 0,
      size: 0
    },
    metrics: {
      prepare: 0,
      dns_lookup: 0,
      tcp_handshake: 0,
      response_time: 0,
      process: 0,
      total: 0,
      on_error: 'prepare'
    }
  };
}