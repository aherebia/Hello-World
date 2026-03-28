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
   * Start date in YYYY-MM-DD format
   */
  dateFrom: string;

  /**
   * End date in YYYY-MM-DD format
   */
  dateTo: string;

  /**
   * Fields to group the report by (must also be included in columns)
   */
  groupBy: string[];

  /**
   * Columns/metrics to include in the report
   */
  columns: string[];

  /**
   * Optional filters to narrow the report
   */
  filters?: Record<string, string | string[]>;

  /**
   * Timezone for the report (default: UTC)
   */
  timezone?: string;

  /**
   * Currency for monetary values (default: USD)
   */
  currency?: string;

  /**
   * Number of results per page (default: 100)
   */
  pageSize?: number;

  /**
   * Page number for pagination (default: 1)
   */
  page?: number;
}

/**
 * Response from POST /api/report
 */
export interface ReportResponse {
  success: boolean;
  message?: string;
  data?: any;
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
