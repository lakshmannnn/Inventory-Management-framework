describe('Inventory Management API Tests', () => {
    const originalURL = 'https://apiforshopsinventorymanagementsystem-qnkc.onrender.com';
    let authToken;
    var productId;
    var firstProductId;
    var prodIdList = new Array();
    let prodName = (Math.random() * 1000).toString(32).substring(1);
    let prodPrice = Math.floor(Math.random() * 1000) + 1;
    let prodQuantity = Math.floor(Math.random() * 100) + 1;
    before(function () {
        //initialize and load fixture data
        cy.fixture("productids.json").then(function (data) {
            globalThis.data = data;
        });
        // Check if the Server up and running
        cy.request({
            method: 'GET',
            // url: `${originalURL}/status`,
            url: "/",
            headers: { Authorization: `Bearer ${authToken}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log("Server up and running!!");
        });
        // Authenticate and get token
        cy.request('POST', `${originalURL}/auth/login`, {
            username: Cypress.env("username"),
            password: Cypress.env("password")
        }).then((response) => {
            expect(response.status).to.eq(200);
            authToken = response.body.token;
        });
        cy.log("User logged in and secured API bearer token!!");
    });
    context('Product Management', () => {
        it('Should add a new product (Happy Path)', () => {
            cy.request({
                method: 'POST',
                url: `${originalURL}/products`,
                headers: { Authorization: `Bearer ${authToken}` },
                body: {
                    name: prodName,
                    price: prodPrice,
                    productType: Cypress.env("prodType"),
                    quantity: prodQuantity
                }
            }).then((response) => {
                expect(response.status).to.eq(201);
                productId = response.body.productId;
                cy.log(`The product id is : ${productId}`);

            });
        });
        it('Should fail to add a product when API invoked without authentication header (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: `${originalURL}/products`,
                failOnStatusCode: false,
                body: {
                    name: prodName,
                    price: prodPrice,
                    productType: Cypress.env("prodType"),
                    quantity: prodQuantity
                }
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });
        it('Should fail to add a product when API invoked with expired bearer token (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: `${originalURL}/products`,
                failOnStatusCode: false,
                headers: { Authorization: `Bearer Cypress.env("expiredAuthToken")` },
                body: {
                    name: prodName,
                    price: prodPrice,
                    productType: Cypress.env("prodType"),
                    quantity: prodQuantity
                }
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });
        // it('Should fail to add a product with duplicate product name and type (Unhappy Path)', () => {
        //     cy.request({
        //         method: 'POST',
        //         url: `${originalURL}/products`,
        //         headers: { Authorization: `Bearer ${authToken}` },
        //         body: {
        //             name: prodName,
        //             price: prodPrice,
        //             productType: Cypress.env("prodType"),
        //             quantity: prodQuantity
        //         }
        //     }).then((response) => {
        //         expect(response.status).to.eq(401);
        //     });
        // });
        it('Should list all existing products using /products API (Happy Path)', () => {
            cy.request({
                method: 'GET',
                url: `${originalURL}/products`,
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((response) => {
                expect(response.status).to.eq(200);
                let body = JSON.parse(JSON.stringify(response.body));
                response.body.forEach(item => {
                    prodIdList.push(item.productId)
                })
                productId = prodIdList[0];
                cy.log(`The productIdList is : ${prodIdList}`);
                cy.log(`The first product id in the list is : ${productId}`);
            });
        });
        it('Should list product details of a specific product via /products/{id} API (Happy Path)', () => {
            cy.log(globalThis.data.productIds[0])
            cy.request({
                method: 'GET',
                url: `${originalURL}/products/${globalThis.data.productIds[0]}`,
                headers: { Authorization: `Bearer ${authToken}` },
            }).then((response) => {
                expect(response.status).to.eq(200);
                cy.log("The product details are:", response.body[0]);
            });
        });
        it('Should update a product', () => {
            cy.request({
                method: 'PUT',
                url: `${originalURL}/products/${globalThis.data.productIds[5]}`,
                headers: { Authorization: `Bearer ${authToken}` },
                body: { price: prodPrice }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.price).to.eq(prodPrice);
            });
        });
        it('Should delete a product', () => {

            //First create a product and then retrive the prod id only to be deleted later
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(authToken, prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                let prodId = body.productId;
                cy.request({
                    method: 'DELETE',
                    url: `${originalURL}/products/${prodId}`,
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                });
            });
        });
    });

context('Stock Management', () => {
    it('Should query stock levels for first product from the available stock', () => {
        //Pullup whole list of products using the /products API
        //Find the productId of the first product in the JSON response

        cy.request({
            method: 'GET',
            url: `${originalURL}/products`,
            headers: { Authorization: `Bearer ${authToken}` }
        }).then((response) => {
            expect(response.status).to.eq(200);
            let body = JSON.parse(JSON.stringify(response.body));
            body.forEach(item => {
                prodIdList.push(item["productId"])
            });
            cy.log(`The productIdList is : ${prodIdList}`);
            firstProductId = prodIdList[0];
            cy.log(`The first product id from the existing stock is : ${firstProductId}`);
            //Query the stock status
            cy.request({
                method: 'GET',
                url: `${originalURL}/orders/product/${firstProductId}`,
                headers: { Authorization: `Bearer ${authToken}` }
            }).then((response) => {
                expect(response.status).to.eq(200);

                // let body = JSON.parse(JSON.stringify(response.body));
                // cy.log(`Stock availability for the first product from stock is : ${body}`); TODO: Update this logic to display response body.
            });
        });
    });
    it('Should query stock levels for a product that was just created', () => {
        //First create a product using /products API
        let prodNameToCheckStock = (Math.random() * 1000).toString(32).substring(1);
        cy.addProduct(authToken, prodNameToCheckStock, prodPrice, Cypress.env("prodType"), prodQuantity).then((response) => {
            expect(response.status).to.eq(201);
            let body = JSON.parse(JSON.stringify(response.body));
            //Find the productId of the same product from the JSON response
            let prodId = body.productId;
            //const orderType = "buy";
            const orderType = Cypress.env("orderType");
            cy.buyProduct(authToken, orderType, prodId, prodQuantity).then((response) => {
                let prodId = response.body.productId;
                // let orderId = response.body.orderId;
                cy.request({
                    method: 'GET',
                    url: `${originalURL}/orders/product/${prodId}`,
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    var body = JSON.parse(JSON.stringify(response.body))
                    let productId = body.productId;
                    var orderType = body.orderType;
                    let newStock = body.newStock;
                    let orderId = body.orderId;
                    let success = body.success;
                    cy.log("productId:" + productId, "orderType:" + orderType, "newStock:" + newStock, "orderId:" + orderId, "success:" + success)
                })
            });
        });
    });
    it('Should buy a product', () => {
        // cy.request({
        //     method: 'GET',
        //     url: `${originalURL}/products`,
        //     headers: { Authorization: `Bearer ${authToken}` }
        // }).then((response) => {
        //     expect(response.status).to.eq(200);
        //     let body = JSON.parse(JSON.stringify(response.body));
        //     body.forEach(item => {
        //         prodIdList.push(item["productId"])
        //     });
        //     cy.log(`The productIdList is : ${prodIdList}`);
        //     firstProductId = prodIdList[0];
        //     cy.log(`The first product id from the existing stock is : ${firstProductId}`); TODO: chenge logic to use productId: ${firstProductId}
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            body: { "orderType": "buy", "productId": globalThis.data.productIds[1], "quantity": 2 }
        }).then((response) => {
            expect(response.status).to.eq(201);
            cy.log(response.body.productName);
            // TODO:Add logic to check if the previousStock newStock updated
        });
    });
    it('Should fail to buy a product with negative quantity (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "buy", "productId": globalThis.data.productIds[3], "quantity": -prodQuantity }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should fail to buy a product with ZERO quantity (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "buy", "productId": globalThis.data.productIds[3], "quantity": 0 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should fail to buy a product with invalid Product id (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "buy", "productId": Cypress.env("invalidProdId"), "quantity": 0 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should sell a product', () => {
        // cy.request({
        //     method: 'GET',
        //     url: `${originalURL}/products`,
        //     headers: { Authorization: `Bearer ${authToken}` }
        // }).then((response) => {
        //     expect(response.status).to.eq(200);
        //     let body = JSON.parse(JSON.stringify(response.body));
        //     body.forEach(item => {
        //         prodIdList.push(item["productId"])
        //     });
        //     cy.log(`The productIdList is : ${prodIdList}`);
        //     firstProductId = prodIdList[0];
        //     cy.log(`The first product id from the existing stock is : ${firstProductId}`); TODO: chenge logic to use productId: ${firstProductId}
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            body: { "orderType": "sell", "productId": globalThis.data.productIds[0], "quantity": prodQuantity } //TODO:It works only for greater than 1
        }).then((response) => {
            expect(response.status).to.eq(201); // TODO:Add logic to check if the previousStock newStock updated by verifying the difference
        });
    });
    it('Should fail to sell a product with max number of stocks(ex:999999) (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "sell", "productId": globalThis.data.productIds[7], "quantity": 999999 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should fail to sell when the stock set to ZERO - prodIdWithStockZero (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "sell", "productId": Cypress.env("prodIdWithStockZero"), "quantity": 100000 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should fail to sell when the API invoked with ZERO quantity (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "sell", "productId": globalThis.data.productIds[3], "quantity": 0 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
    it('Should fail to sell when the API invoked with invalid product id (Unhappy Path)', () => {
        cy.request({
            method: 'POST',
            url: `${originalURL}/orders`,
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
            body: { "orderType": "sell", "productId": Cypress.env("invalidProdId"), "quantity": 0 }
        }).then((response) => {
            expect(response.status).to.eq(400);
        });
    });
});
})