import {PostierObjectWithMetrics, RequestData} from '../types/types.ts';
import {invoke} from "@tauri-apps/api/core";

export const sendRequest = async (requestData: RequestData): Promise<PostierObjectWithMetrics> => {
  try {
    return await invoke<PostierObjectWithMetrics>('send_request_with_metrics', {
      requestData: {
        ...requestData,
        composed_url: requestData.composedUrl,
        content_type: requestData.contentType,
      }
    });
  } catch (error) {
    return {
      request: requestData,
      response: {
        id: requestData.id,
        timestamp: Date.now(),
        status: 0,
        statusText: `Error`,
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
        socketInit: 0,
        dnsLookup: 0,
        tcpHandshake: 0,
        transferStart: 0,
        download: 0,
        process: 0,
        total: 0,
      }
    };
  }
};