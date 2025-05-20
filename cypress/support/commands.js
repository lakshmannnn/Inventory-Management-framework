// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
Cypress.Commands.add('addProduct', (authToken, prodName, prodPrice, prodType, prodQuantity) => {
    cy.request({
        method: 'POST',
        url: ("/products"),
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
            name: prodName,
            price: prodPrice,
            productType: prodType,
            quantity: prodQuantity
        }
    })
})
Cypress.Commands.add('buyOrder', (authToken, orderType, productId, prodQuantity) => {
    cy.request({
        method: 'POST',
        url: `/orders`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
            orderType: orderType,
            productId: productId,
            quantity: prodQuantity
        }
    })
});
Cypress.Commands.add('buyOrder', (authToken, orderType, productId, prodQuantity) => {
    const failOnStatusCode = Cypress.env("failOnStatusCode");
    cy.request({
        method: 'POST',
        url: `/orders`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: failOnStatusCode,
        body: {
            orderType: orderType,
            productId: productId,
            quantity: prodQuantity
        }
    })
});
Cypress.Commands.add('sellOrder', (orderType, productId, prodQuantity) => {
    const failOnStatusCode = Cypress.env("failOnStatusCode");
    cy.log(prodQuantity),
        cy.request({
            method: 'POST',
            url: `/orders`,
            headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
            failOnStatusCode: failOnStatusCode,
            body: {
                orderType: "sell",
                productId: "${productId}",
                quantity: "${prodQuantity}"

            }
        })
});


// Cypress.Commands.add('sellOrder', (authToken, orderType, productId, prodQuantity) => {
//     const failOnStatusCode = Cypress.env("failOnStatusCode");
//     //below code incase you want to use prodIdInit from beforeEach hook
//     cy.get("@prodIdInit").then((prodIdInit) => {
//         cy.request({
//             method: 'POST',
//             url: `/orders`,
//             headers: { Authorization: `Bearer ${authToken}` },
//             failOnStatusCode: failOnStatusCode,
//             body: {
//                 orderType: orderType,
//                 productId: prodIdInit,
//                 quantity: prodQuantity
//             }
//         })
//     })
// });
Cypress.Commands.add("setGlobalVar", key => {
    Cypress.env(key);
});

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... }))