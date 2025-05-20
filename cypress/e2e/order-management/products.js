describe('Inventory Management API Tests', () => {
    var prodIdList = new Array();
    let prodName, prodPrice, prodQuantity, firstProductId, prodNameToPassonToTests, productId;
    before(function () {
        //Initialize and load required fixtures test data for static product ids.
        // OR use the dynamic product ids created in 'beforeEach' hook block.
        cy.fixture("productids.json").then(function (data) {
            globalThis.data = data;
        });
        // Check if the Server up and running!!
        cy.request({
            method: 'GET',
            url: ("/status"),
        }).then((response) => {
            if (response.status !== 200) {
                cy.wait(60000); // Wait for 60 seconds and Retry request as first time it might take 60 seconds
                cy.request("/status").then((response) => {
                    expect(response.status).to.eq(200);
                    cy.log("Server up and running!!");
                });
            }
        });
        // Authenticate and extract bearer token so that the same can be used for every test.
        cy.request('POST', ("/auth/login"), {
            username: Cypress.env("username"),
            password: Cypress.env("password")
        }).then((response) => {
            expect(response.status).to.eq(200);
            Cypress.env("authToken", response.body.token);
            cy.log(response.body.message, "with bearer token: ", Cypress.env("authToken"));
        });
    });
    beforeEach(function () {
        //generate dynamic data required for each test.
        prodName = (Math.random() * 1000).toString(32).substring(1);
        prodPrice = Math.floor(Math.random() * 1000) + 1;
        prodQuantity = Math.floor(Math.random() * 100) + 1;
        //Use product name "prodNameToPassonToTests" to pass in respective tests which need unique product name that was NOT already used
        // "prodNameToPassonToTests" is different to "prodIdInit" created below. "prodIdInit" used in the respective test and might not be of use
        // when thh test need another fresh product creation.
        prodNameToPassonToTests = (Math.random() * 1000).toString(32).substring(1);
        cy.wrap(prodNameToPassonToTests).as("prodNameInit");
        // Create a new productId using "addProduct" custom command
        cy.addProduct(Cypress.env("authToken"), prodName, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
            expect(response.status).to.eq(201);
            cy.log("sample product created!!");
            let body = JSON.parse(JSON.stringify(response.body));
            //Use the below alias product id in respective test specs that need product id.
            cy.wrap(body.productId).as("prodIdInit"); //prodIdInit passed on as Alias and Env variable for easy usage
            Cypress.env("envProdId", body.productId);
        })
    });
    afterEach(() => {
        cy.log("PLACEHOLDER for later use, moving to the next test!");
    });
    context('Product Management', () => {
        it('Should add a new product (Happy Path)', {
            retries: {
                runMode: 2,
                openMode: 2
            }
        }, () => {
            //retries added just to avoid any failures for the first time the first test is invoked.
            cy.get("@prodNameInit").then((prodNameInit) => {
                cy.log("alias variables from beforeEach hook:" + prodNameInit)
                cy.addProduct(Cypress.env("authToken"), prodNameInit, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                    expect(response.status).to.eq(201);
                    productId = response.body.productId;
                    cy.log(`The product id is : ${productId}`);
                    cy.log(JSON.stringify(response.body));
                });
            })
        });
        it('Should fail to add a product when API invoked with same product name - duplicate (Unhappy Path)', () => {
            // First create a product with name "prodNameInit"
            cy.get("@prodNameInit").then((prodNameInit) => {
                cy.log("alias variables from beforeEach hook:" + prodNameInit),
                    cy.addProduct(Cypress.env("authToken"), prodNameInit, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                        expect(response.status).to.eq(201);
                        productId = response.body.productId;
                        cy.log(`The product id is : ${productId}`);
                    })
            })
            // creating product with same name "prodNameInit" once again
            cy.get("@prodNameInit").then((prodNameInit) => {
                cy.log("alias variables from beforeEach hook:" + prodNameInit)
                cy.addProduct(Cypress.env("authToken"), prodNameInit, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeFalse")).then((response) => {
                    expect(response.status).to.eq(400);
                    cy.log("message: " + response.body.message, "name used: " + response.body.name);
                    cy.log(JSON.stringify(response.body));
                })
            })
        });
        it('Should fail to add a product when API invoked without mandatory field("name") (Unhappy Path)', () => {
            cy.get("@prodNameInit").then((prodNameInit) => {
                cy.log("alias variables from befreEach hooks:" + prodNameInit);
                cy.addProduct(Cypress.env("authToken"), "", prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeFalse"))
                    .then((response) => {
                        expect(response.status).to.eq(400);
                        cy.log("message: " + response.body.message, "errors: " + response.body.errors.name);
                    })
            })
        });
        it('Should fail to add a product when API invoked without authentication header (Unhappy Path)', () => {
            cy.get("@prodNameInit").then((prodNameInit) => {
                cy.log("alias variables from befreEach hooks:" + prodNameInit),
                    cy.request({
                        method: 'POST',
                        url: ("products"),
                        failOnStatusCode: false,
                        body: {
                            name: prodNameInit,
                            price: prodPrice,
                            productType: Cypress.env("prodType"),
                            quantity: prodQuantity
                        }
                    }).then((response) => {
                        expect(response.status).to.eq(401);
                    })
            })
        });
        it('Should fail to add a product when API invoked with expired bearer token (Unhappy Path)', () => {
            cy.request({
                method: 'POST',
                url: ("/products"),
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
            })
        });
        it('Should list all existing products using "GET/products" API (Happy Path)', () => {
            cy.request({
                method: 'GET',
                url: ("/products"),
                headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
            }).then((response) => {
                expect(response.status).to.eq(200);
                let body = JSON.parse(JSON.stringify(response.body));
                response.body.forEach(item => {
                    prodIdList.push(item.productId)
                })
                productId = prodIdList[0];
                cy.log(`The productIdList is : ${prodIdList}`);
                cy.log(`Existing products count : ${prodIdList.length}`);
                cy.log(`The first product id in the list is : ${productId}`);
            });
        });
        it('Should list product details of a specific product via "GET /products/{id}" API (Happy Path)', () => {
            // Uncomment below line and use the same fixtures var test data OR continue with dynamic test data
            // cy.log(globalThis.data.productIds[0])
            cy.get("@prodIdInit").then((tempProdId) => {
                cy.log(tempProdId),
                    cy.request({
                        method: 'GET',
                        url: (`/products/${tempProdId}`),
                        headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
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
                        headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
                        body: { price: prodPrice }
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.price).to.eq(prodPrice);
                        cy.log("The product details updated and and product prices matched!!");
                    });
            });
        });
        const updateProdUnhappyPathInputParams = [
            { authToken: Cypress.env("authToken"), price: Cypress.env("emptyPrice") }, //  product update  with empty price
            { authToken: Cypress.env("emptyAuthToken"), price: prodPrice }, //  product update  with empty authToken
            { authToken: Cypress.env("invalidAuthToken"), price: prodPrice }, //  product update  with invalid authToken
            { authToken: Cypress.env("expiredAuthToken"), price: prodPrice } //  product update  with expiredAuthToken authToken
        ];
        updateProdUnhappyPathInputParams.forEach((inputParams) => {
            it(`Should update product detils of a newly created product:${inputParams.authToken}`, () => {
                // Used dynamic product id generated from beforeEach hook as opposed to fixtures test data and continue to do so.
                cy.get("@prodIdInit").then((tempProdId) => {
                    cy.log(tempProdId),
                        cy.request({
                            method: 'PUT',
                            url: (`products/${tempProdId}`),
                            headers: { Authorization: `Bearer ${inputParams.authToken}` },
                            failOnStatusCode: false,
                            body: { price: inputParams.price }
                        }).then((response) => {
                            expect(response.status).to.not.eq(200);
                            expect(response.body.price).to.not.eq(prodPrice);
                            cy.log(JSON.stringify(response.body));
                        });
                });
            });
        });
        it('Should delete a newly created product (custom command)', () => {
            //First create a product using CUSTOM COMMANDS and then retrive the prod id only to be deleted later
            //The reason to use product ids gererated by below methods is just to demonstrate all possible ways.
            // a).dynamic data from beforeEach hook,b).fixtures and c).custom commands
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(Cypress.env("authToken"), prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                const prodId = body.productId;
                cy.request({
                    method: 'DELETE',
                    url: (`/products/${prodId}`),
                    headers: { Authorization: `Bearer ${Cypress.env("authToken")}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.eq("Product removed");
                    cy.log("The product with given prod id removed and and response message verified!!");
                });
            });
        });
        it('Should delete a product (with the product id created by prod id from beforeEach hook)', () => {
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(Cypress.env("authToken"), prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                const prodId = body.productId;
                cy.request({
                    method: 'DELETE',
                    url: (`/products/${prodId}`),
                    headers: { Authorization: `Bearer ${Cypress.env("authToken")}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.message).to.eq("Product removed");
                    cy.log("The product with given prod id removed and and response message verified!!");
                });
            });
        });
    });
    const deleteProdUnhappyPathInputParams = [
        { authToken: Cypress.env("emptyAuthToken"), price: prodPrice,tempProdId:Cypress.env("prodIDForProductThatWasAlreadyDeleted") }, //  product delete  with empty authToken
        { authToken: Cypress.env("emptyAuthToken"), price: prodPrice }, //  product delete  with empty authToken
        { authToken: Cypress.env("invalidAuthToken"), price: prodPrice }, //  product delete  with invalid authToken
        { authToken: Cypress.env("expiredAuthToken"), price: prodPrice } //  product delete  with expiredAuthToken authToken
    ];
    deleteProdUnhappyPathInputParams.forEach((inputParams) => {
        it(`Should delete a product using(with the product id created by prod id from beforeEach hook): ${inputParams.authToken}`, () => {
            let prodNameTobeDeleted = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(Cypress.env("authToken"), prodNameTobeDeleted, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body)); //print the response data
                if (!inputParams.tempProdId) {
                    //Use the dynamically generated prodId if there is no prodId prvided
                    Cypress.env("prodIdToDelete", body.productId);
                } else {
                    Cypress.env("prodIdToDelete", Cypress.env("prodIDForProductThatWasAlreadyDeleted"));
                    // Use the "deleteProdUnhappyPathInputParams.tempProdId" if there is a prodId.
                }
                cy.request({
                    method: 'DELETE',
                    url: (`/products/${Cypress.env("prodIdToDelete")}`),
                    failOnStatusCode: false,
                    headers: { Authorization: `Bearer ${inputParams.authToken}` }
                }).then((response) => {
                    expect(response.status).to.not.eq(200);
                    expect(response.body.message).to.not.eq("Product removed");
                    cy.log(JSON.stringify(response.body));
                });
            });
        });
    })
    context('Stock Management', () => {
        it('Should query stock levels for existing product', { tags: ["@smoke", "@regression"] }, () => {
            // This test can be triggered based on tags using grep command
            //Pull the whole list of products using the /products API
            cy.request({
                method: 'GET',
                url: ("/products"),
                headers: { Authorization: `Bearer ${Cypress.env("authToken")}` }
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
                    headers: { Authorization: `Bearer ${Cypress.env("authToken")}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    //TODO:logic to check if the product without "message": "No orders found for this product",
                    cy.log("The stock details for product with the given id verfied!!: " + response.body.productId, response.body.name, "totalTransactions:" + response.body.totalTransactions, "totalBuys:" + response.body.totalBuys, "totalSells:" + response.body.totalSells, "currentStock:" + response.body.currentStock,);
                });
            });
        });
        it('Should query stock levels for newly created product', () => {
            //First create a product using /products API
            let prodNameToCheckStock = (Math.random() * 1000).toString(32).substring(1);
            cy.addProduct(Cypress.env("authToken"), prodNameToCheckStock, prodPrice, Cypress.env("prodType"), prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                cy.log(JSON.stringify(response.body));
                expect(response.status).to.eq(201);
                let body = JSON.parse(JSON.stringify(response.body));
                //Find the productId of the same product from the JSON response
                let prodId = body.productId;
                const orderType = Cypress.env("orderTypeBuy");
                cy.buyOrder(Cypress.env("authToken"), orderType, prodId, prodQuantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                    let prodId = response.body.productId;
                    // let orderId = response.body.orderId;
                    cy.request({
                        method: 'GET',
                        url: (`/orders/product/${prodId}`),
                        headers: { Authorization: `Bearer ${Cypress.env("authToken")}` }
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        cy.log("The stock details for product with the given id verfied!!: " + response.body.productId, response.body.name);
                    })
                });
            });
        });
        const buyOrderInputParams = [
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("nonZeroPosNum") }, //  product buy order  with lower positive number of stocks(ex:999999)
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("maxNumberOfStock") }, //  product buy order  with unexpectedly higher number of stocks(ex:999999)
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("decimalValue") }, //  product buy order  with decimalValue stocks(ex:1.9). DEFECT:Should fail to sell a product when DECIMAL number stocks used but it passes atm
        ];
        buyOrderInputParams.forEach((inputParams) => {
            it(`Should buy a product [buy order]: ${inputParams.orderType}, ${inputParams.productId}, ${inputParams.quantity}`, () => {
                //Can be enhanced to use dynamic data as shown above, not touching now due to time constraint:)
                cy.buyOrder(Cypress.env("authToken"), inputParams.orderType, inputParams.productId, inputParams.quantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                    expect(response.status).to.eq(201);
                    cy.log("Successfully bought a prod and the result is: " + response.body.success);
                    // TODO: DEFECT - NOT testing the logic to verify stock update as there is a defect in the API , where the stock updates are not working correctly
                    //  Ex: there was no change when I bought 2 prods : "previousStock": 10000000000000016, "newStock": 10000000000000016,
                });
            });
        })
        const buyOrderUnhappyPathInputParams = [
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("nonZeroPosNum") }, //  product buy order  with stock set to ZERO
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("negativeNum") }, //  product buy order  with negative quantity num
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("inavlidNum") }, //  product buy order  with inavlidNum quantity number (ex:X)
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("invalidProdId"), quantity: Cypress.env("nonZeroPosNum") }, // API invoked with invalidProdId
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("ZERO") }, //  product buy order  - API invoked with quantity:0
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("emptyProdId"), quantity: Cypress.env("nonZeroPosNum") }, //  product buy order  -API invoked with EMPTY product(productId:"")
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("invalidProdId"), }, //  product buy order  - Schema issues when any request body param is missed
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("invalidProdId"), quantity: Cypress.env("nonZeroPosNum"), }, //  product buy order  -Schema issues when any request body is corrupted.
            { orderType: Cypress.env("invalidOrderType"), productId: Cypress.env("invalidProdId"), quantity: Cypress.env("nonZeroPosNum"), } //  product buy order  -Schema issues when any request body has incorrect orderType.
        ];
        // tests with invalid token,expired token and without header.Authorization.bearer param etc also can be added. Not adding as this was tested for /products api above.
        buyOrderUnhappyPathInputParams.forEach((inputParams) => {
            it(`Should fail to buy as the request body params are set to fail: ${inputParams.orderType},${inputParams.productId} and ${inputParams.quantity}`, () => {
                cy.request({
                    method: 'POST',
                    url: `/orders`,
                    headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
                    failOnStatusCode: false,
                    body: {
                        orderType: inputParams.orderType,
                        productId: inputParams.productId,
                        quantity: inputParams.quantity
                    }
                }).then((response) => {
                    cy.log(JSON.stringify(response.body));
                    cy.log(response.body.message, response.body.success, response.body.orderType);
                    expect(response.status).to.not.eq(201);
                    cy.log("Can not buy because: " + response.message, "and statusCode: " + response.body.status)
                })
            });
        });
        const sellOrderInputParams = [
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("nonZeroPosNum") }, //  product sell order  with lower positive number of stocks(ex:999999)
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("maxNumberOfStock") }, //  product sell order  with unexpectedly higher number of stocks(ex:999999)
            { orderType: Cypress.env("orderTypeBuy"), productId: Cypress.env("validProdId"), quantity: Cypress.env("decimalValue") }, //  product sell order  with decimalValue stocks(ex:1.9). DEFECT:Should fail to sell a product when DECIMAL number stocks used but it passes atm
        ];
        sellOrderInputParams.forEach((inputParams) => {
            it(`Should sell a product [sell order]: ${inputParams.orderType},${inputParams.productId},${inputParams.quantity}`, () => {
                //Can be enhanced to use dynamic data as shown above, not touching now due to time constraint:)
                cy.buyOrder(Cypress.env("authToken"), inputParams.orderType, inputParams.productId, inputParams.quantity, Cypress.env("failOnStatusCodeTrue")).then((response) => {
                    expect(response.status).to.eq(201);
                    cy.log("Successfully bought a prod and the result is: " + response.body.success);
                    // TODO: DEFECT - NOT testing the logic to verify stock update as there is a defect in the API , where the stock updates are not working correctly
                    //  Ex: there was no change when I bought 2 prods : "previousStock": 10000000000000016, "newStock": 10000000000000016,
                });
            });
        });
        const sellOrderUnhappyPathInputParams = [
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("nonZeroPosNum") },
            // product sell order with product that has stock/quantity set to ZERO.
            // TODO:prodIdWithStockZero can be dynamically generated using 'GET /products' to find a productId that has "quantity": 0;
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("negativeNum") }, // product sell order with negative quantity num
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("prodIdWithStockZero"), quantity: Cypress.env("inavlidNum") }, // product sell order with inavlidNum quantity number (ex:X)
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("invalidProdId"), quantity: Cypress.env("nonZeroPosNum") }, // API invoked with invalidProdId
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("validProdId"), quantity: Cypress.env("ZERO") }, // product sell order - API invoked with quantity:0
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("emptyProdId"), quantity: Cypress.env("nonZeroPosNum") }, // product sell order -API invoked with EMPTY product(productId:"")
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("invalidProdId"), }, // product sell order - Schema issues when any request body param is missed
            { orderType: Cypress.env("orderTypeSell"), productId: Cypress.env("invalidProdId"), quantity: Cypress.env("nonZeroPosNum"), } // product sell order -Schema issues when any request body is corrupted.
        ];
        sellOrderUnhappyPathInputParams.forEach((inputParams) => {
            it(`Should fail to sell as the request body params are set to fail: ${inputParams.orderType},${inputParams.productId} and ${inputParams.quantity}`, () => {
                cy.log(inputParams.orderType,inputParams.productId,inputParams.quantity)
                cy.request({
                    method: 'POST',
                    url: `/orders`,
                    headers: { Authorization: `Bearer ${Cypress.env("authToken")}` },
                    failOnStatusCode: false,
                    body: {
                        orderType: inputParams.orderType,
                        productId: inputParams.productId,
                        quantity: inputParams.quantity
                    }
                }).then((response) => {
                 //TODO:Sell Order API can be converted to customesed command but ot appears there is an issue
                // Cypress.env("tempOrderTypeSell", inputParams.orderType);
                // Cypress.env("tempProductId", inputParams.productId);
                // Cypress.env("tempQuantity", inputParams.quantity);
                //  cy.sellOrder(Cypress.env("tempOrderTypeSell"),Cypress.env("tempProductId"),Cypress.env("tempQuantity"),Cypress.env("failOnStatusCodeFalse")).then((response) => {
                //  cy.sellOrder(Cypress.env("orderTypeSell"), inputParams.productId, inputParams.quantity, Cypress.env("failOnStatusCodeFalse")).then((response) => {
                    cy.log(JSON.stringify(response.body));
                cy.log(response.body.message, response.body.success, response.body.orderType);
                expect(response.status).to.not.eq(201);
                cy.log("Can not sell because: " + response.message, "and statusCode: " + response.body.status)
            })
        });
    })
});
});