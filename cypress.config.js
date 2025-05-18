const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx,feature}",
    baseUrl: "https://apiforshopsinventorymanagementsystem-qnkc.onrender.com/status",
    env: {
      username: "user01",
      password: "secpassword*",
      prodType: "laptops",
      expiredAuthToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTJiY2NlZDVkZGIzYjkyYmY5MTYxMSIsImlhdCI6MTc0NzUwMTg1MCwiZXhwIjoxNzQ3NTA1NDUwfQ.zi5e4BkW7LTTr6MQU4-6kvDwe9hm9gnnp5aHxYPGj7k",
      prodIdWithStockZero: "efb8aba9-f83d-4f76-b5ba-79f124786d14",
      invalidProdId: "invalid-random-number",
      orderType:'buy'
    }
  },
});

