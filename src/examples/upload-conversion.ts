import * as dotenv from 'dotenv';
import { ClickFlareClient, Conversion } from '../index';

// Load environment variables
dotenv.config();

/**
 * Example: Upload a single conversion to ClickFlare
 */
async function uploadSingleConversion() {
  // Initialize the ClickFlare client
  const client = new ClickFlareClient({
    trackerDomain: process.env.CLICKFLARE_TRACKER_DOMAIN || 'tracker.yourdomain.com',
    useHttps: process.env.CLICKFLARE_USE_HTTPS !== 'false',
    timeout: parseInt(process.env.CLICKFLARE_TIMEOUT || '10000'),
  });

  console.log('ClickFlare API Integration - Single Conversion Upload Example\n');
  console.log(`Tracker Domain: ${client.getBaseUrl()}\n`);

  // Test connection first
  console.log('Testing connection to ClickFlare...');
  const isConnected = await client.testConnection();
  console.log(`Connection status: ${isConnected ? 'OK' : 'FAILED'}\n`);

  // Prepare conversion data
  const conversion: Conversion = {
    clickId: 'abc123def456', // Replace with actual click ID from ClickFlare
    conversionType: 'sale',
    payout: 29.99,
    transactionId: 'ORDER-12345',
    timestamp: new Date().toISOString(),
    customParams: {
      param1: 'custom_value_1',
      param2: 'custom_value_2',
    },
  };

  console.log('Uploading conversion:');
  console.log(JSON.stringify(conversion, null, 2));
  console.log();

  // Upload the conversion
  const result = await client.uploadConversion(conversion);

  console.log('Upload result:');
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Example: Upload multiple conversions
 */
async function uploadMultipleConversions() {
  const client = new ClickFlareClient({
    trackerDomain: process.env.CLICKFLARE_TRACKER_DOMAIN || 'tracker.yourdomain.com',
  });

  console.log('\nClickFlare API Integration - Multiple Conversions Upload Example\n');

  // Prepare multiple conversions
  const conversions: Conversion[] = [
    {
      clickId: 'click_id_001',
      conversionType: 'sale',
      payout: 49.99,
      transactionId: 'TXN-001',
    },
    {
      clickId: 'click_id_002',
      conversionType: 'lead',
      payout: 5.00,
      transactionId: 'TXN-002',
    },
    {
      clickId: 'click_id_003',
      conversionType: 'signup',
      payout: 2.50,
      transactionId: 'TXN-003',
    },
  ];

  console.log(`Uploading ${conversions.length} conversions...\n`);

  // Upload all conversions
  const results = await client.uploadConversions(conversions);

  // Display results
  results.forEach((result, index) => {
    console.log(`Conversion ${index + 1}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result.success) {
      console.log(`  Error: ${result.message}`);
    }
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(`\nTotal: ${successCount}/${conversions.length} conversions uploaded successfully`);
}

/**
 * Example: Format batch conversions for CSV upload
 */
function formatBatchConversions() {
  const client = new ClickFlareClient({
    trackerDomain: 'tracker.yourdomain.com',
  });

  console.log('\nClickFlare API Integration - Batch CSV Format Example\n');

  const batchConversions = [
    {
      clickId: 'click_001',
      payout: 29.99,
      transactionId: 'ORDER-001',
      conversionType: 'sale',
      timestamp: Date.now(),
    },
    {
      clickId: 'click_002',
      payout: 19.99,
      transactionId: 'ORDER-002',
      conversionType: 'sale',
      timestamp: Date.now(),
    },
  ];

  const csvData = client.formatBatchConversions(batchConversions);

  console.log('CSV Format (for manual upload to ClickFlare):');
  console.log('Format: click_id, payout, transaction_id, conversion_type, timestamp\n');
  console.log(csvData);
}

// Run examples
async function main() {
  try {
    await uploadSingleConversion();
    await uploadMultipleConversions();
    formatBatchConversions();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}
