describe('Basic practise tests', () => {

    it("demo Cypress.log() and set the session storage", () => {
        //demo Cypress.log() used in setSessionStorage custom command
        cy.visit("https://www.webdriveruniversity.com/Login-Portal/index.html");
        cy.get('#text').type("webdriver");
        cy.get('#password').type("webdriver123");
        cy.get('#login-button').click();
        cy.demoCypressDotLog("key", "1234567");
        cy.setSessionStorage("Key", "987654321");
    });

    it("set the session storage key value with the token extracted using /auth/login API",{tags:['@smoke','@regression']}, () => {
        // Authenticate and extract bearer token so that the same can be used for every test.
        cy.request('POST', ("/auth/login"), {
            username: Cypress.env("username"),
            password: Cypress.env("password")
        }).then((response) => {
            expect(response.status).to.eq(200);
            Cypress.env("authToken", response.body.token);
            cy.log(response.body.message, "with bearer token: ", Cypress.env("authToken"));
            cy.setSessionStorage("Key", Cypress.env("authToken"));
        });

        //demo Cypress.log() used in setSessionStorage custom command
        cy.visit("https://www.webdriveruniversity.com/Login-Portal/index.html");
        cy.get('#text').type(Cypress.env("username"));
        cy.get('#password').type(Cypress.env("password"));
        cy.get('#login-button').click();
        cy.demoCypressDotLog("key", "1234567");
        cy.setSessionStorage("Key", "987654321");
    })

    it.only('Accessibility - "Axe Dev tools" - should have no detectable a11y violations',{tags:['@smoke','@regression','tagId1']}, () => {
    // cy.visit('https://rahulshettyacademy.com/loginpagePractise/');
    cy.origin('https://rahulshettyacademy.com/loginpagePractise/');
    cy.injectAxe();//Injects axe-core into the page, use After cy.visit(
    cy.checkA11y();//Runs accessibility checks using axe-core, use After cy.inject
  });

})