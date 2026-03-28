import * as dotenv from 'dotenv';
import { ClickFlareClient } from '../clickflare-client';
import { ReportRequest } from '../types';

dotenv.config();

/**
 * Fetches campaign report for the last year grouped by trackingField4.
 * Columns: campaignID, campaignName, trackingField4
 *
 * Usage: ts-node src/scripts/campaign-report.ts
 */
async function fetchCampaignReport() {
  const trackerDomain = process.env.CLICKFLARE_TRACKER_DOMAIN;
  const apiKey = process.env.CLICKFLARE_API_KEY;

  if (!trackerDomain || !apiKey) {
    console.error('Missing required env vars: CLICKFLARE_TRACKER_DOMAIN, CLICKFLARE_API_KEY');
    process.exit(1);
  }

  const client = new ClickFlareClient({
    trackerDomain,
    apiKey,
    useHttps: process.env.CLICKFLARE_USE_HTTPS !== 'false',
    timeout: parseInt(process.env.CLICKFLARE_TIMEOUT || '10000'),
  });

  // Date range: last 365 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const request: ReportRequest = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    groupBy: ['campaignID', 'trackingField4'],
    metrics: ['campaignID', 'campaignName', 'trackingField4'],
    timezone: process.env.CLICKFLARE_TIMEZONE || 'America/New_York',
    currency: process.env.CLICKFLARE_CURRENCY || 'USD',
    pageSize: 100,
    page: 1,
  };

  console.log('Fetching ClickFlare campaign report...');
  console.log(`Date range: ${request.startDate} → ${request.endDate}`);
  console.log(`Grouped by: ${request.groupBy.join(', ')}\n`);

  let page = 1;
  let totalRows = 0;
  const allRows: any[] = [];

  // Paginate through all results
  while (true) {
    const result = await client.getReport({ ...request, page });

    if (!result.success) {
      console.error('Report fetch failed:', result.message);
      process.exit(1);
    }

    const rows: any[] = result.data?.data ?? result.data?.rows ?? result.data ?? [];

    if (!Array.isArray(rows) || rows.length === 0) break;

    allRows.push(...rows);
    totalRows += rows.length;

    // Stop if fewer rows than pageSize (last page)
    if (rows.length < (request.pageSize ?? 100)) break;

    page++;
  }

  if (allRows.length === 0) {
    console.log('No data returned for the given date range.');
    return;
  }

  // Print results as a table
  console.log(`${'Campaign ID'.padEnd(20)} ${'Campaign Name'.padEnd(40)} ${'trackingField4'.padEnd(30)}`);
  console.log('-'.repeat(92));

  for (const row of allRows) {
    const id = String(row.campaignID ?? row.campaign_id ?? '').padEnd(20);
    const name = String(row.campaignName ?? row.campaign_name ?? '').padEnd(40);
    const tf4 = String(row.trackingField4 ?? row.tracking_field_4 ?? '').padEnd(30);
    console.log(`${id} ${name} ${tf4}`);
  }

  console.log(`\nTotal rows: ${totalRows}`);
}

fetchCampaignReport();
