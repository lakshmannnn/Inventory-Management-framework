/**
 * PACT Contract Test for Inventory Management API
 * This file defines the contract between the consumer (Cypress tests) and the provider (Inventory Management API)
 * PACT tests verify that both the consumer and provider agree on the API contracts
 */

const { Pact, Matchers } = require('@pact-foundation/pact');
const { expect } = require('chai');
const axios = require('axios');
const path = require('path');

describe('Inventory Management API - PACT Contract Tests', () => {
  const BASE_URL = 'http://localhost:8080';
  let provider;
  let consumer;

  // Initialize PACT provider for testing
  beforeEach(() => {
    provider = new Pact({
      consumer: 'InventoryManagementConsumer',
      provider: 'InventoryManagementProvider',
      port: 8080,
      log: path.resolve(process.cwd(), 'cypress/pact/logs', 'pact.log'),
      dir: path.resolve(process.cwd(), 'cypress/pact/pacts'),
    });

    return provider.setup();
  });

  afterEach(() => {
    return provider.finalize();
  });

  describe('Authentication API Contract', () => {
    it('should provide a valid auth token on successful login', () => {
      const expectedBody = Matchers.like({
        token: Matchers.regex({
          generate: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
          matcher: '.*',
        }),
        message: 'Login successful',
      });

      return provider
        .addInteraction({
          state: 'user credentials are valid',
          uponReceiving: 'a login request',
          withRequest: {
            method: 'POST',
            path: '/auth/login',
            body: {
              username: Matchers.like('testuser'),
              password: Matchers.like('testpassword'),
            },
            headers: {
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 200,
            body: expectedBody,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/auth/login`, {
            username: 'testuser',
            password: 'testpassword',
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('token');
          expect(response.data).to.have.property('message', 'Login successful');
        });
    });

    it('should reject login with invalid credentials', () => {
      return provider
        .addInteraction({
          state: 'user credentials are invalid',
          uponReceiving: 'a login request with invalid credentials',
          withRequest: {
            method: 'POST',
            path: '/auth/login',
            body: {
              username: Matchers.like('invaliduser'),
              password: Matchers.like('invalidpassword'),
            },
            headers: {
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 401,
            body: Matchers.like({
              message: 'Invalid credentials',
              errors: Matchers.like({ auth: 'Unauthorized' }),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/auth/login`, {
            username: 'invaliduser',
            password: 'invalidpassword',
          });
        })
        .catch((error) => {
          expect(error.response.status).to.equal(401);
          expect(error.response.data).to.have.property('message');
        });
    });
  });

  describe('Product Management API Contract', () => {
    const authToken = 'Bearer valid-token-12345';

    it('should retrieve all products with valid authentication', () => {
      const expectedBody = Matchers.eachLike(
        {
          productId: Matchers.uuid(),
          name: Matchers.like('Product Name'),
          price: Matchers.like(99.99),
          productType: Matchers.like('Electronics'),
          quantity: Matchers.like(100),
          createdAt: Matchers.iso8601DateTime(),
        },
        { min: 1 }
      );

      return provider
        .addInteraction({
          state: 'products exist',
          uponReceiving: 'a GET request to retrieve all products',
          withRequest: {
            method: 'GET',
            path: '/products',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 200,
            body: expectedBody,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.get(`${BASE_URL}/products`, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.be.an('array');
          expect(response.data[0]).to.have.all.keys(
            'productId',
            'name',
            'price',
            'productType',
            'quantity',
            'createdAt'
          );
        });
    });

    it('should retrieve a specific product by ID with valid authentication', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      return provider
        .addInteraction({
          state: `product with ID ${productId} exists`,
          uponReceiving: `a GET request to retrieve product with ID ${productId}`,
          withRequest: {
            method: 'GET',
            path: `/products/${productId}`,
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              productId: productId,
              name: Matchers.like('Sample Product'),
              price: Matchers.like(49.99),
              productType: Matchers.like('Electronics'),
              quantity: Matchers.like(50),
              createdAt: Matchers.iso8601DateTime(),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.get(`${BASE_URL}/products/${productId}`, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('productId', productId);
          expect(response.data).to.have.property('name');
          expect(response.data).to.have.property('price');
        });
    });

    it('should create a new product with valid data', () => {
      const newProduct = {
        name: Matchers.like('New Product'),
        price: Matchers.like(99.99),
        productType: Matchers.like('Electronics'),
        quantity: Matchers.like(100),
      };

      return provider
        .addInteraction({
          state: 'API is ready to create a new product',
          uponReceiving: 'a POST request to create a new product',
          withRequest: {
            method: 'POST',
            path: '/products',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: newProduct,
          },
          willRespondWith: {
            status: 201,
            body: Matchers.like({
              productId: Matchers.uuid(),
              name: 'New Product',
              price: 99.99,
              productType: 'Electronics',
              quantity: 100,
              message: 'Product added successfully',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/products`, newProduct, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(201);
          expect(response.data).to.have.property('productId');
          expect(response.data).to.have.property('message', 'Product added successfully');
        });
    });

    it('should reject product creation with missing mandatory field (name)', () => {
      const invalidProduct = {
        name: '',
        price: 99.99,
        productType: 'Electronics',
        quantity: 100,
      };

      return provider
        .addInteraction({
          state: 'product creation with missing mandatory field',
          uponReceiving: 'a POST request to create product with empty name',
          withRequest: {
            method: 'POST',
            path: '/products',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: invalidProduct,
          },
          willRespondWith: {
            status: 400,
            body: Matchers.like({
              message: 'Validation failed',
              errors: Matchers.like({
                name: 'Name is required',
              }),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/products`, invalidProduct, {
            headers: { Authorization: authToken },
          });
        })
        .catch((error) => {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('message');
          expect(error.response.data).to.have.property('errors');
        });
    });

    it('should update an existing product', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';
      const updateData = {
        price: Matchers.like(199.99),
      };

      return provider
        .addInteraction({
          state: `product with ID ${productId} exists and is ready to be updated`,
          uponReceiving: `a PUT request to update product with ID ${productId}`,
          withRequest: {
            method: 'PUT',
            path: `/products/${productId}`,
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: updateData,
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              productId: productId,
              name: Matchers.like('Sample Product'),
              price: 199.99,
              productType: Matchers.like('Electronics'),
              quantity: Matchers.like(50),
              message: 'Product updated successfully',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.put(`${BASE_URL}/products/${productId}`, updateData, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('price', 199.99);
          expect(response.data).to.have.property('message', 'Product updated successfully');
        });
    });

    it('should delete an existing product', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      return provider
        .addInteraction({
          state: `product with ID ${productId} exists and is ready to be deleted`,
          uponReceiving: `a DELETE request to remove product with ID ${productId}`,
          withRequest: {
            method: 'DELETE',
            path: `/products/${productId}`,
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              message: 'Product removed',
              productId: productId,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.delete(`${BASE_URL}/products/${productId}`, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('message', 'Product removed');
        });
    });

    it('should reject product operations without authentication header', () => {
      return provider
        .addInteraction({
          state: 'request is sent without authorization header',
          uponReceiving: 'a GET request to retrieve products without auth header',
          withRequest: {
            method: 'GET',
            path: '/products',
            headers: {
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 401,
            body: Matchers.like({
              message: 'Authorization header missing or invalid',
              errors: Matchers.like({ auth: 'Unauthorized' }),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.get(`${BASE_URL}/products`);
        })
        .catch((error) => {
          expect(error.response.status).to.equal(401);
        });
    });
  });

  describe('Stock Management API Contract', () => {
    const authToken = 'Bearer valid-token-12345';

    it('should retrieve current stock level for a product', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      return provider
        .addInteraction({
          state: `product with ID ${productId} has transaction history`,
          uponReceiving: `a GET request to retrieve stock levels for product ${productId}`,
          withRequest: {
            method: 'GET',
            path: `/orders/product/${productId}`,
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              productId: productId,
              name: Matchers.like('Sample Product'),
              totalTransactions: Matchers.like(10),
              totalBuys: Matchers.like(5),
              totalSells: Matchers.like(5),
              currentStock: Matchers.like(50),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.get(`${BASE_URL}/orders/product/${productId}`, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('productId');
          expect(response.data).to.have.property('currentStock');
          expect(response.data).to.have.property('totalTransactions');
        });
    });

    it('should create a buy order for a product', () => {
      const orderData = {
        orderType: Matchers.like('BUY'),
        productId: Matchers.like('550e8400-e29b-41d4-a716-446655440000'),
        quantity: Matchers.like(10),
      };

      return provider
        .addInteraction({
          state: 'product exists and stock is available',
          uponReceiving: 'a POST request to create a buy order',
          withRequest: {
            method: 'POST',
            path: '/orders',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: orderData,
          },
          willRespondWith: {
            status: 201,
            body: Matchers.like({
              orderId: Matchers.uuid(),
              productId: '550e8400-e29b-41d4-a716-446655440000',
              orderType: 'BUY',
              quantity: 10,
              previousStock: Matchers.like(50),
              newStock: Matchers.like(60),
              success: true,
              message: 'Order created successfully',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/orders`, orderData, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(201);
          expect(response.data).to.have.property('orderId');
          expect(response.data).to.have.property('success', true);
        });
    });

    it('should create a sell order for a product', () => {
      const orderData = {
        orderType: Matchers.like('SELL'),
        productId: Matchers.like('550e8400-e29b-41d4-a716-446655440000'),
        quantity: Matchers.like(5),
      };

      return provider
        .addInteraction({
          state: 'product exists and stock is sufficient for selling',
          uponReceiving: 'a POST request to create a sell order',
          withRequest: {
            method: 'POST',
            path: '/orders',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: orderData,
          },
          willRespondWith: {
            status: 201,
            body: Matchers.like({
              orderId: Matchers.uuid(),
              productId: '550e8400-e29b-41d4-a716-446655440000',
              orderType: 'SELL',
              quantity: 5,
              previousStock: Matchers.like(50),
              newStock: Matchers.like(45),
              success: true,
              message: 'Order created successfully',
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/orders`, orderData, {
            headers: { Authorization: authToken },
          });
        })
        .then((response) => {
          expect(response.status).to.equal(201);
          expect(response.data).to.have.property('orderId');
          expect(response.data).to.have.property('orderType', 'SELL');
        });
    });

    it('should reject order with insufficient stock for sell operation', () => {
      const orderData = {
        orderType: Matchers.like('SELL'),
        productId: Matchers.like('550e8400-e29b-41d4-a716-446655440000'),
        quantity: Matchers.like(1000),
      };

      return provider
        .addInteraction({
          state: 'product exists but stock is insufficient for requested sell quantity',
          uponReceiving: 'a POST request to create sell order with insufficient stock',
          withRequest: {
            method: 'POST',
            path: '/orders',
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
            body: orderData,
          },
          willRespondWith: {
            status: 400,
            body: Matchers.like({
              success: false,
              message: 'Insufficient stock to process this order',
              currentStock: Matchers.like(50),
              requestedQuantity: 1000,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.post(`${BASE_URL}/orders`, orderData, {
            headers: { Authorization: authToken },
          });
        })
        .catch((error) => {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.have.property('success', false);
        });
    });
  });

  describe('Status API Contract', () => {
    it('should retrieve API and database status', () => {
      return provider
        .addInteraction({
          state: 'API and database are healthy',
          uponReceiving: 'a GET request to check API and database status',
          withRequest: {
            method: 'GET',
            path: '/status',
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              status: 'UP',
              database: Matchers.like('Connected'),
              timestamp: Matchers.iso8601DateTime(),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })
        .then(() => {
          return axios.get(`${BASE_URL}/status`);
        })
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data).to.have.property('status', 'UP');
          expect(response.data).to.have.property('database');
        });
    });
  });
});
