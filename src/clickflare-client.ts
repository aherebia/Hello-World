import axios, { AxiosInstance } from 'axios';
import {
  ClickFlareConfig,
  Conversion,
  BatchConversion,
  ConversionResponse,
  ReportRequest,
  ReportResponse,
} from './types';

/**
 * ClickFlare API Client for uploading online conversions and fetching reports
 */
export class ClickFlareClient {
  private config: Required<Omit<ClickFlareConfig, 'apiKey'>> & { apiKey?: string };
  private httpClient: AxiosInstance;
  private baseUrl: string;
  private apiBaseUrl: string;

  constructor(config: ClickFlareConfig) {
    this.config = {
      useHttps: true,
      timeout: 10000,
      ...config,
    };

    const protocol = this.config.useHttps ? 'https' : 'http';
    this.baseUrl = `${protocol}://${this.config.trackerDomain}`;
    this.apiBaseUrl = 'https://public-api.clickflare.io';

    this.httpClient = axios.create({
      timeout: this.config.timeout,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'api-key': this.config.apiKey } : {}),
      },
    });
  }

  /**
   * Fetch a campaign report from ClickFlare
   *
   * @param request - Report request parameters
   * @returns Promise with report response
   */
  async getReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const url = `${this.apiBaseUrl}/api/report`;
      const response = await this.httpClient.post(url, request);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: `Failed to fetch report: HTTP ${response.status}`,
          data: response.data,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error fetching report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Upload a single conversion using S2S postback (GET request)
   */
  async uploadConversion(conversion: Conversion): Promise<ConversionResponse> {
    try {
      const url = this.buildConversionUrl(conversion);
      const response = await this.httpClient.get(url);

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
   */
  async uploadConversions(conversions: Conversion[]): Promise<ConversionResponse[]> {
    const results: ConversionResponse[] = [];
    for (const conversion of conversions) {
      const result = await this.uploadConversion(conversion);
      results.push(result);
    }
    return results;
  }

  private buildConversionUrl(conversion: Conversion): string {
    const params = new URLSearchParams();
    params.append('click_id', conversion.clickId);
    params.append('ct', conversion.conversionType);
    if (conversion.payout !== undefined) params.append('payout', conversion.payout.toString());
    if (conversion.transactionId) params.append('transaction_id', conversion.transactionId);
    if (conversion.timestamp) params.append('timestamp', conversion.timestamp);
    if (conversion.customParams) {
      Object.entries(conversion.customParams).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
    }
    return `${this.baseUrl}/cf/cv?${params.toString()}`;
  }

  formatBatchConversions(conversions: BatchConversion[]): string {
    return conversions
      .map((conv) => `${conv.clickId}, ${conv.payout}, ${conv.transactionId}, ${conv.conversionType}, ${conv.timestamp || ''}`)
      .join('\n');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.httpClient.get(this.baseUrl, { timeout: 5000 });
      return response.status < 500;
    } catch {
      return false;
    }
  }
}
