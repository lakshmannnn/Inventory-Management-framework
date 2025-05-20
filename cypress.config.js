const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx,feature}",
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
    }
  },
});

