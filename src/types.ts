/**
 * ClickFlare API Types and Interfaces
 */

/**
 * Configuration for ClickFlare API client
 */
export interface ClickFlareConfig {
  /**
   * Your ClickFlare tracker domain (e.g., 'tracker.yourdomain.com')
   */
  trackerDomain: string;

  /**
   * ClickFlare API key (from Settings > Security > API Access)
   */
  apiKey?: string;

  /**
   * Use HTTPS for API requests (default: true)
   */
  useHttps?: boolean;

  /**
   * Request timeout in milliseconds (default: 10000)
   */
  timeout?: number;
}

/**
 * Request body for POST /api/report
 */
export interface ReportRequest {
  /**
   * Start date in ISO 8601 format
   */
  startDate: string;

  /**
   * End date in ISO 8601 format
   */
  endDate: string;

  /**
   * Fields to group the report by (must also be included in metrics)
   */
  groupBy: string[];

  /**
   * Metrics/columns to include in the report
   */
  metrics: string[];

  /**
   * Timezone for the report (e.g., 'America/New_York')
   */
  timezone?: string;

  /**
   * Sort by field
   */
  sortBy?: string;

  /**
   * Sort order: 'asc' or 'desc'
   */
  orderType?: 'asc' | 'desc';

  /**
   * Currency for monetary values (e.g., 'USD', 'EUR')
   */
  currency?: string;

  /**
   * Page number for pagination (default: 1)
   */
  page?: number;

  /**
   * Number of results per page (default: 100)
   */
  pageSize?: number;

  /**
   * Search string
   */
  search?: string;

  /**
   * Include all results
   */
  includeAll?: boolean;

  /**
   * Filters for metrics
   */
  metricsFilters?: Array<{
    name: string;
    operator: string;
    value: string[];
  }>;

  /**
   * Comparison metrics
   */
  compare?: string[];

  /**
   * Conversion timestamp type: 'visit' or other
   */
  conversionTimestamp?: string;

  /**
   * Workspace IDs to filter by
   */
  workspace_ids?: string[];
}

/**
 * Response from POST /api/report
 */
export interface ReportResponse {
  success: boolean;
  message?: string;
  data?: ReportData;
}

/**
 * Report data structure from API
 */
export interface ReportData {
  /**
   * Array of report rows with metrics
   */
  items: ReportItem[];

  /**
   * Totals across all rows
   */
  totals: Record<string, number>;

  /**
   * Comparison data (if compare parameter was used)
   */
  compare?: Record<string, number[]>;

  /**
   * Comparison totals (if compare parameter was used)
   */
  compareTotals?: Record<string, number>;
}

/**
 * Individual report row
 */
export interface ReportItem {
  [metric: string]: number | string;
}

/**
 * Conversion data for tracking
 */
export interface Conversion {
  /**
   * Unique click ID from ClickFlare
   */
  clickId: string;

  /**
   * Conversion type/name (e.g., 'sale', 'lead', 'signup')
   */
  conversionType: string;

  /**
   * Revenue/payout amount for this conversion
   */
  payout?: number;

  /**
   * Unique transaction ID from your system or affiliate network
   */
  transactionId?: string;

  /**
   * Timestamp of the conversion (ISO 8601 format)
   * If not provided, ClickFlare will use the upload time
   */
  timestamp?: string;

  /**
   * Custom parameters to pass with the conversion (param1-param20)
   */
  customParams?: Record<string, string | number>;
}

/**
 * Batch conversion upload data (CSV format)
 */
export interface BatchConversion {
  /**
   * Unique click ID from ClickFlare
   */
  clickId: string;

  /**
   * Revenue/payout amount
   */
  payout: number;

  /**
   * Unique transaction ID
   */
  transactionId: string;

  /**
   * Conversion type/name
   */
  conversionType: string;

  /**
   * Unix timestamp or ISO 8601 date string
   */
  timestamp?: number | string;
}

/**
 * Response from ClickFlare conversion tracking
 */
export interface ConversionResponse {
  success: boolean;
  message?: string;
  data?: any;
}
