export interface UsageRecord {
  apiKey: string;
  endpoint: string;
  timestamp: number;
  responseTimeMs: number;
  statusCode: number;
  inputSize: number;
}

interface UsageSummary {
  totalRequests: number;
  endpoints: Record<string, number>;
  lastRequest: number;
}

const usageStore = new Map<string, UsageRecord[]>();
const MAX_RECORDS_PER_KEY = 10_000;

export function trackUsage(record: UsageRecord) {
  const records = usageStore.get(record.apiKey) || [];
  records.push(record);
  if (records.length > MAX_RECORDS_PER_KEY) {
    records.splice(0, records.length - MAX_RECORDS_PER_KEY);
  }
  usageStore.set(record.apiKey, records);
}

export function getUsageSummary(apiKey: string): UsageSummary {
  const records = usageStore.get(apiKey) || [];
  const endpoints: Record<string, number> = {};
  let lastRequest = 0;

  for (const r of records) {
    endpoints[r.endpoint] = (endpoints[r.endpoint] || 0) + 1;
    if (r.timestamp > lastRequest) lastRequest = r.timestamp;
  }

  return {
    totalRequests: records.length,
    endpoints,
    lastRequest,
  };
}

export function getUsageByPeriod(
  apiKey: string,
  startTime: number,
  endTime: number
): UsageRecord[] {
  const records = usageStore.get(apiKey) || [];
  return records.filter((r) => r.timestamp >= startTime && r.timestamp <= endTime);
}
