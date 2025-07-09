const { defineConfig } = require("cypress");
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = defineConfig({
  projectId: 'qojzkj',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners
      on('file:preprocessor', cucumber())
    },
    // The setupNodeEvents function in Cypress is a powerful hook that lets you tap into the
    // Node.js process that runs outside the browser. It’s used to configure plugins, register
    // custom tasks, and modify Cypress behavior during the test lifecycle.

    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx,feature}",
    //  specPattern: "cypress/e2e/webdriver-uni/features/**/*.feature",

    // baseUrl: "https://rahulshettyacademy.com/loginpagePractise/",
    baseUrl: "https://apiforshopsinventorymanagementsystem-qnkc.onrender.com",
    env: {
      username: "user01",
      password: "secpassword*",
      prodType: "laptops",
      expiredAuthToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTJiY2NlZDVkZGIzYjkyYmY5MTYxMSIsImlhdCI6MTc0NzUwMTg1MCwiZXhwIjoxNzQ3NTA1NDUwfQ.zi5e4BkW7LTTr6MQU4-6kvDwe9hm9gnnp5aHxYPGj7k",
      emptyAuthToken: "",
      invalidAuthToken: "abc123",
      prodIdWithStockZero: "755698de-4a2c-4547-ba35-66f77d58a358",
      prodIDForProductThatWasAlreadyDeleted: "6a9dd855-4fae-4236-bb1a-fc95ac937eed",
      invalidProdId: "invalid-random-number",
      validProdId: "cb5912ec-d2a2-422c-976e-232abd47f08f",
      emptyProdId: "",
      orderTypeBuy: "buy",
      orderTypeSell: "sell",
      failOnStatusCodeFalse: false,
      failOnStatusCodeTrue: true,
      maxNumberOfStock: 1000000009, //At the min validProdId is set with stock 1000000001
      nonZeroPosNum: 3,
      invalidNumber: "X",
      negativeNum: -5,
      ZERO: 0,
      decimalValue: 1.9,
      invalidOrderType: "neither Buy nor Sell",
      emptyPrice: ""
    },
    experimentalStudio: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true
    }
  },
});

