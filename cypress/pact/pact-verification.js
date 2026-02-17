/**
 * PACT Verification Helper
 * This utility helps verify PACT contracts between consumer and provider
 * Run this file to verify that the API provider meets the PACT contracts
 */

const { Verifier } = require('@pact-foundation/pact');
const path = require('path');

const pactVerificationTask = async () => {
  const opts = {
    provider: 'InventoryManagementProvider',
    providerBaseUrl: process.env.PROVIDER_URL || 'http://localhost:8080',
    pactFiles: [
      path.resolve(
        process.cwd(),
        'cypress/pact/pacts/InventoryManagementConsumer-InventoryManagementProvider.json'
      ),
    ],
    logLevel: 'debug',
    stateHandlers: {
      'user credentials are valid': async () => {
        console.log('Setting state: user credentials are valid');
        // Add setup logic here to prepare the provider state
      },
      'user credentials are invalid': async () => {
        console.log('Setting state: user credentials are invalid');
        // Add setup logic here
      },
      'products exist': async () => {
        console.log('Setting state: products exist');
        // Create test products or setup initial state
      },
      'product with ID 550e8400-e29b-41d4-a716-446655440000 exists': async () => {
        console.log('Setting state: product exists');
        // Create specific test product
      },
      'API is ready to create a new product': async () => {
        console.log('Setting state: API is ready to create a new product');
      },
      'product creation with missing mandatory field': async () => {
        console.log('Setting state: product creation with missing mandatory field');
      },
      'product with ID 550e8400-e29b-41d4-a716-446655440000 exists and is ready to be updated': async () => {
        console.log('Setting state: product ready to be updated');
      },
      'product with ID 550e8400-e29b-41d4-a716-446655440000 exists and is ready to be deleted': async () => {
        console.log('Setting state: product ready to be deleted');
      },
      'request is sent without authorization header': async () => {
        console.log('Setting state: request without auth header');
      },
      'product with ID 550e8400-e29b-41d4-a716-446655440000 has transaction history': async () => {
        console.log('Setting state: product has transaction history');
      },
      'product exists and stock is available': async () => {
        console.log('Setting state: product exists and stock is available');
      },
      'product exists and stock is sufficient for selling': async () => {
        console.log('Setting state: product exists and stock is sufficient for selling');
      },
      'product exists but stock is insufficient for requested sell quantity': async () => {
        console.log('Setting state: product has insufficient stock');
      },
      'API and database are healthy': async () => {
        console.log('Setting state: API and database are healthy');
      },
    },
  };

  try {
    console.log('Starting PACT verification...');
    await new Verifier(opts).verifyProvider();
    console.log('PACT verification passed! ✓');
  } catch (error) {
    console.error('PACT verification failed:');
    console.error(error);
    process.exit(1);
  }
};

// Run verification if executed directly
if (require.main === module) {
  pactVerificationTask();
}

module.exports = pactVerificationTask;
