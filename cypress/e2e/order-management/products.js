describe('Inventory Management API Tests', () => {
    let authToken;
    var productId;
    var firstProductId;
    var prodIdList = new Array();
    let prodName = (Math.random() * 1000).toString(32).substring(1);
    let prodPrice = Math.floor(Math.random() * 1000) + 1;
    let prodQuantity = Math.floor(Math.random() * 100) + 1;
    before(function () {
        //Initialize and load required fixtures test data for static product ids.
        // OR use the dynamic product ids created in 'beforeEach' hook block.
        cy.fixture("productids.json").then(function (data) {
            globalThis.data = data;
        });
        // Check if the Server up and running
        cy.request({
            method: 'GET',
            url: ("/" + "/status"),
            headers: { Authorization: `Bearer ${authToken}` },
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log("Server up and running!!");
        });
    });
    beforeEach(function () {
        // Authenticate and extract bearer token
        let tempProdName = (Math.random() * 1000).toString(32).substring(1);
        cy.request('POST', ("/" + "/auth/login"), {
            username: Cypress.env("username"),
            password: Cypress.env("password")
        }).then((response) => {
            expect(response.status).to.eq(200);
            authToken = response.body.token;
            cy.log("User logged in and secured API bearer token!!");
            cy.log(authToken);
            cy.request({
                method: 'POST',
                url: ("/" + "/products"),
                headers: { Authorization: `Bearer ${authToken}` },
                body: {
                    name: tempProdName,
                    price: prodPrice,
                    productType: Cypress.env("prodType"),
                    quantity: prodQuantity
                }
            }).then((response) => {
                expect(response.status).to.eq(201);
                cy.log("sample product created!!");
                let body = JSON.parse(JSON.stringify(response.body));
                //Use the below alias product id in respective test specs that need product id.
                cy.wrap(body.productId).as("prodIdInit");
            })
        })
    });
    context('Product Management', () => {
        it('Should add a new product (Happy Path)', () => {
            let tempProdName = (Math.random() * 1000).toString(32).substring(1);
            cy.request({
                method: 'POST',
                url: ("/products"),
                headers: { Authorization: `Bearer ${authToken}` },
                body: {
                    name: tempProdName,
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
                url: ("/" + "/products"),
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
                url: ("/" + "/products"),
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
        //         url: ("/"+"/products"),
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
                url: ("/" + "/products"),
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
            // Uncomment below line and use the same fixtures var test data OR continue with dynamic test data
            // cy.log(globalThis.data.productIds[0])
            cy.get("@prodIdInit").then((tempProdId) => {
                cy.log(tempProdId),
                    cy.request({
                        method: 'GET',
                        url: (`/products/${tempProdId}`),
                        headers: { Authorization: `Bearer ${authToken}` },
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.productId).to.eq(tempProdId);
                        cy.log("The product details retrieved and product ids matched!!");
                    });
            })
        });
        it('Should update product detils of a newly created product', () => {
            // Used dynamic product id generated from beforeEach hook as opposed to fixtures test data and continue to do so.
            cy.get("@prodIdInit").then((tempProdId) => {
                cy.log(tempProdId),
                    cy.request({
                        method: 'PUT',
                        url: (`products/${tempProdId}`),
                        headers: { Authorization: `Bearer ${authToken}` },
                        body: { price: prodPrice }
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.price).to.eq(prodPrice);
                        cy.log("The product details updated and and product prices matched!!");
                    });
            });
        });
        it('Should delete a newly created product (custom command)', () => {
            //First create a product using CUSTOM COMMANDS and then retrive the prod id only to be deleted later
            //The reason to use product ids gererated by below methods is just to demonstrate all possible ways.
            // a).dynamic data from beforeEach hook,b).fixtures and c).custom commands
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(authToken, prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                const prodId = body.productId;
                cy.request({
                    method: 'DELETE',
                    url: (`/products/${prodId}`),
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.eq("Product removed");
                    cy.log("The product with given prod id removed and and response message verified!!");
                });
            });
        });
        it('Should delete a product (with the product id created by prod id from beforeEach hook)', () => {
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(authToken, prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                const prodId = body.productId;
                cy.request({
                    method: 'DELETE',
                    url: (`/products/${prodId}`),
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.eq("Product removed");
                    cy.log("The product with given prod id removed and and response message verified!!");
                });
            });
        });
    });
    context('Stock Management', () => {
        // it('Should query stock levels for existing product', () => {
        it('Should query stock levels for existing product',{ tags: ["@smoke", "@regression"] }, () => {
            //Pull the whole list of products using the /products API
            cy.request({
                method: 'GET',
                url: ("/" + "/products"),
                headers: { Authorization: `Bearer ${authToken}` }
            }).then((response) => {
                expect(response.status).to.eq(200);
                //Find any product id from the response (for ex: productId of the first product in the JSON response)
                let body = JSON.parse(JSON.stringify(response.body));
                body.forEach(item => {
                    prodIdList.push(item["productId"])
                });
                // Print the whole list of product ids for all the existing products
                cy.log(`The productIdList is : ${prodIdList}`);
                firstProductId = prodIdList[0];
                cy.log(`The first product id from the existing stock is : ${firstProductId}`);
                //Query the stock status
                cy.request({
                    method: 'GET',
                    url: (`/orders/product/${firstProductId}`),
                    headers: { Authorization: `Bearer ${authToken}` }
                }).then((response) => {
                    // expect(response.body.productId).to.eq(${firstProductId});
                    expect(response.status).to.eq(200);
                    cy.log("The stock details for product with the given id verfied!!: " + response.body.productId, response.body.name,"totalTransactions:"+response.body.totalTransactions,"totalBuys:"+response.body.totalBuys,"totalSells:"+response.body.totalSells,"currentStock:"+response.body.currentStock,);
                });
            });
        });
        it('Should query stock levels for newly created product', () => {
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
                        url: (`/orders/product/${prodId}`),
                        headers: { Authorization: `Bearer ${authToken}` }
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        cy.log("The stock details for product with the given id verfied!!: " + response.body.productId, response.body.name);
                    })
                });
            });
        });
        it('Should buy a product ', () => {
            //Can be enhanced to use dynamic data as shown above, not touching now:)
            // Note to buy or sell a product , it should have history of previous orders
            // OR you would receive   "message": "No orders found for this product" - Strange behaviour , to me it is a defect.
            cy.request({
                method: 'POST',
                url: ("/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                body: { "orderType": "buy", "productId": globalThis.data.productIds[1], "quantity": 2 }
            }).then((response) => {
                expect(response.status).to.eq(201);
                cy.log("Successfully bought a prod and the result is: " + response.body.success);
                //check if the previousStock and newStock updated
                // TODO: NOT testing the logic as there is a defect in the API , where the stock updates are not working correctly
                //  ex: there was no change when I bought 2 prods : "previousStock": 10000000000000016, "newStock": 10000000000000016,
            });
        });
        it('Should fail to buy a product with negative quantity (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "buy", "productId": globalThis.data.productIds[3], "quantity": -prodQuantity }
            }).then((response) => {
                expect(response.status).to.eq(400);
                cy.log("Can not buy as negative quantity provided:: check the response message: " + response.body.message, response.body.received);
                // TODO: There is a defect that it accepts decimal quantity while buying[and probably selling too]
            });
        });
        it('Should fail to buy a product with ZERO quantity (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "buy", "productId": globalThis.data.productIds[3], "quantity": 0 }
            }).then((response) => {
                expect(response.status).to.eq(400);
                cy.log("Can not buy as ZERO quantity provided: check the response message: " + response.body.message, response.body.received);
            });
        });
        it('Should fail to buy a product with invalid Product id (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "buy", "productId": Cypress.env("invalidProdId"), "quantity": 2 }
            }).then((response) => {
                expect(response.status).to.eq(404);
                cy.log("Can not buy as non existent prod id provided: check the response message: " + response.body.message);
            });
        });
        it('Should sell a product', () => {
            cy.request({
                method: 'POST',
                url: ("/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                body: { "orderType": "sell", "productId": globalThis.data.productIds[0], "quantity": prodQuantity } //TODO:It works only for greater than 1
            }).then((response) => {
                expect(response.status).to.eq(201);
                cy.log("Sold successfully and response message: " + response.body.success);
                // TODO:Add logic to check if the previousStock newStock updated by verifying the difference
            });
        });
        it('Should fail to sell a product with max number of stocks(ex:999999) (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/" + "/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "sell", "productId": globalThis.data.productIds[7], "quantity": 999999 }
            }).then((response) => {
                expect(response.status).to.eq(400);
                cy.log("Can not sell as requested stock exists check the response message: " + response.body.message);
            });
        });
        it('Should fail to sell when the stock set to ZERO - prodIdWithStockZero (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/" + "/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "sell", "productId": Cypress.env("prodIdWithStockZero"), "quantity": 100000 }
            }).then((response) => {
                expect(response.status).to.eq(400);
                cy.log("The product do not exists as stock is set to ZERO,the response message: " + response.body.message);
            });
        });
        it('Should fail to sell when the API invoked with ZERO quantity (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/" + "/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "sell", "productId": globalThis.data.productIds[3], "quantity": 0 }
            }).then((response) => {
                expect(response.status).to.eq(400);
                cy.log("Can not sell as the API invoked with ZERO quantity , response message: " + response.body.message);
            });
        });
        it('Should fail to sell when the API invoked with invalid product id (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/" + "/orders"),
                headers: { Authorization: `Bearer ${authToken}` },
                failOnStatusCode: false,
                body: { "orderType": "sell", "productId": Cypress.env("invalidProdId"), "quantity": 3 }
            }).then((response) => {
                expect(response.status).to.eq(404);
                cy.log("Can not sell as API invoked with invalid product id , response message: " + response.body.message);
            });
        });
    });
});
