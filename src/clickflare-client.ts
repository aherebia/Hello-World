import axios, { AxiosInstance } from 'axios';
import {
  ClickFlareConfig,
  Conversion,
  BatchConversion,
  ConversionResponse,
} from './types';

/**
 * ClickFlare API Client for uploading online conversions
 */
export class ClickFlareClient {
  private config: Required<ClickFlareConfig>;
  private httpClient: AxiosInstance;
  private baseUrl: string;

  constructor(config: ClickFlareConfig) {
    this.config = {
      useHttps: true,
      timeout: 10000,
      ...config,
    };

    const protocol = this.config.useHttps ? 'https' : 'http';
    this.baseUrl = `${protocol}://${this.config.trackerDomain}`;

    this.httpClient = axios.create({
      timeout: this.config.timeout,
      validateStatus: () => true, // Handle all status codes manually
    });
  }

  /**
   * Upload a single conversion using S2S postback (GET request)
   *
   * @param conversion - Conversion data to upload
   * @returns Promise with conversion response
   */
  async uploadConversion(conversion: Conversion): Promise<ConversionResponse> {
    try {
      // Build the conversion URL with query parameters
      const url = this.buildConversionUrl(conversion);

      // Send GET request to ClickFlare
      const response = await this.httpClient.get(url);

      // Check if the request was successful
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: 'Conversion uploaded successfully',
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: `Failed to upload conversion: HTTP ${response.status}`,
          data: response.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error uploading conversion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Upload multiple conversions sequentially
   *
   * @param conversions - Array of conversions to upload
   * @returns Promise with array of conversion responses
   */
  async uploadConversions(conversions: Conversion[]): Promise<ConversionResponse[]> {
    const results: ConversionResponse[] = [];

    for (const conversion of conversions) {
      const result = await this.uploadConversion(conversion);
      results.push(result);
    }

    return results;
  }

  /**
   * Build the conversion tracking URL with all parameters
   *
   * @param conversion - Conversion data
   * @returns Complete URL for the conversion request
   */
  private buildConversionUrl(conversion: Conversion): string {
    const params = new URLSearchParams();

    // Required parameters
    params.append('click_id', conversion.clickId);
    params.append('ct', conversion.conversionType);

    // Optional parameters
    if (conversion.payout !== undefined) {
      params.append('payout', conversion.payout.toString());
    }

    if (conversion.transactionId) {
      params.append('transaction_id', conversion.transactionId);
    }

    if (conversion.timestamp) {
      params.append('timestamp', conversion.timestamp);
    }

    // Custom parameters (param1-param20)
    if (conversion.customParams) {
      Object.entries(conversion.customParams).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }

    return `${this.baseUrl}/cf/cv?${params.toString()}`;
  }

  /**
   * Format batch conversions to CSV format for manual upload
   * Format: click_id, payout, transaction_id, conversion_type, timestamp
   *
   * @param conversions - Array of batch conversions
   * @returns CSV formatted string
   */
  formatBatchConversions(conversions: BatchConversion[]): string {
    const lines = conversions.map((conv) => {
      const timestamp = conv.timestamp || '';
      return `${conv.clickId}, ${conv.payout}, ${conv.transactionId}, ${conv.conversionType}, ${timestamp}`;
    });

    return lines.join('\n');
  }

  /**
   * Get the base URL for the ClickFlare tracker
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Test the connection to ClickFlare tracker
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.httpClient.get(this.baseUrl, {
        timeout: 5000,
      });
      return response.status < 500;
    } catch (error) {
      return false;
    }
  }
}
