import {PostierObject, RequestData} from '../types/types.ts';
import {invoke} from "@tauri-apps/api/core";

// interface for http metrics
interface HttpMetrics {
  prepare: number;       // request preparation time in ms
  socket_init: number;   // socket initialization time in ms
  dns_lookup: number;    // dns resolution time in ms
  tcp_handshake: number; // tcp handshake time in ms
  transfer_start: number;// transfer start time in ms
  download: number;      // download time in ms
  process: number;       // process time in ms
  total: number;         // total time in ms
}

// extended interface for metrics
interface PostierObjectWithMetrics extends PostierObject {
  metrics: HttpMetrics;
}

// main function that calls our rust http client
export const sendRequest = async (requestData: RequestData): Promise<PostierObjectWithMetrics> => {
  try {
    // direct call to the rust plugin via tauri
    return await invoke<PostierObjectWithMetrics>('plugin:http_metrics|send_request_with_metrics', {
      requestData
    });
  } catch (error) {
    // in case of error in the rust plugin, build an error response
    console.error('Error in Rust HTTP client:', error);

    return {
      request: requestData,
      response: {
        id: requestData.id,
        timestamp: Date.now(),
        status: 0,
        statusText: `Error: ${error}`,
        headers: null,
        data: error instanceof Error ? error.message : String(error),
        time: 0,
        size: 0,
      },
      debug: [
        {key: 'Error', value: String(error), enabled: true}
      ],
      metrics: {
        prepare: 0,
        socket_init: 0,
        dns_lookup: 0,
        tcp_handshake: 0,
        transfer_start: 0,
        download: 0,
        process: 0,
        total: 0,
      }
    };
  }
}; 