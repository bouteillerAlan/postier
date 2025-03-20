import {PostierObjectWithMetrics, RequestData} from '../types/types.ts';
import {invoke} from "@tauri-apps/api/core";

export const sendRequest = async (requestData: RequestData): Promise<PostierObjectWithMetrics> => {
  try {
    const rep = await invoke<PostierObjectWithMetrics>('send_request_with_metrics', {
      requestData: {
        ...requestData,
        composed_url: requestData.composedUrl,
        content_type: requestData.contentType,
      }
    });
    return {
      ...rep,
      metrics: {
        ...rep.metrics,
        total: rep.response.time
      }
    };
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
        dns_lookup: 0,
        tcp_handshake: 0,
        response_time: 0,
        process: 0,
        total: 0,
        on_error: 'total'
      }
    };
  }
};