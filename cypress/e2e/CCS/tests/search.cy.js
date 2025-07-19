const AGREEMENTS_URL = "https://www.crowncommercial.gov.uk/agreements/?&status=Live&regulation=PCR2015&type=Dynamic+Purchasing+System&pillar=Technology&keyword=Digital&page=1";

describe('This suite is to test the search and filter capability', () => {

    it('Happy Path - Search and filter', () => {
        cy.visit("https://www.crowncommercial.gov.uk/");
        cy.get('.gtm--accept-cookies-in-banner').click()
        cy.get('#framework_q').type('Digital');
        cy.get(".homepage-hero__search-button").eq(0).click();
        // cy.get(".homepage-hero__search-button").first().click();
        cy.get('.govuk-heading-m > span').should('contain', 'agreements found');
        cy.get('#PCR2015', { timeout: 1000 }).scrollIntoView();
        // cy.get('[type="checkbox"]').eq(22).click();
        cy.get('[type="checkbox"]').check('PCR2015');
        // cy.get('#Dynamic+Purchasing+System', { timeout: 1000 }).scrollIntoView();
        cy.get('[type="checkbox"]').check('Dynamic+Purchasing+System');
        cy.get('[type="checkbox"]').check('Technology');
        // var url = cy.url();
        // cy.log(url);
        // Cypress.env("urlWithFilters",cy.url());

        cy.get('.govuk-heading-m > span').should('contain', '5 agreements found');
        cy.xpath("//a[contains(text(),'Gigabit Capable Connectivity DPS')][1]").should('exist');
        cy.get('div[class="hideWithoutJS"] li:nth-child(1) h3:nth-child(1) a').should('contain', 'Gigabit Capable Connectivity DPS')
        //TODO: Order of the agreements displayed in the UI is not always constant, hence the below assertion may fail
        // cy.fixture('agreements.json').then(agreements => {
        //     globalThis.agreements = agreements;
        // for (let i = 1; i <= 5; i++) {
        //     cy.log(agreements.headings[i - 1]);
        //     cy.get(`div[class="hideWithoutJS"] li:nth-child(${i}) h3:nth-child(1) a`)
        //         .should('contain', agreements.headings[i - 1]);
        //     cy.log(agreements.agreementIDs[i - 1]);
        //     cy.get(`div[class="hideWithoutJS"] li:nth-child(${i}) ul li:nth-child(1)`)
        //         .should('contain', agreements.agreementIDs[i - 1]);
        //     cy.log(agreements.startDates[i - 1]);
        //     cy.get(`div[class="hideWithoutJS"] li:nth-child(${i}) ul li:nth-child(2)`)
        //         .should('contain', agreements.startDates[i - 1]);
        // }
        // TODO: COMPLETE BELOW
        cy.fixture('agreements-new.json').then(agreements => {
            globalThis.agreements = agreements;
            // Validating agreement properties such as heading, ID and Start Date
            for (let i = 1; i <= 5; i++) {
                cy.get(`div.hideWithoutJS li:nth-child(${i}) h3:nth-child(1) a`)
                    .invoke('text')
                    .then((text) => {
                        agreements.agreementArray.forEach((agreement) => {
                            if (text.includes(agreement.heading)) {
                                cy.log(agreement.heading);
                                cy.log(agreement.agreementID);
                                cy.log(agreement.startDate);
                                cy.get(`div.hideWithoutJS li:nth-child(${i}) ul li:nth-child(1)`)
                                    .should('contain', agreement.agreementID);
                                cy.get(`div.hideWithoutJS li:nth-child(${i}) ul li:nth-child(2)`)
                                    .should('contain', agreement.startDate);
                            }
                        });
                    });
            }
            // Verify Agreement Key Facts for each 'Searched agreements' Link
            for (let i = 1; i <= 5; i++) {
                cy.get(`div.hideWithoutJS li:nth-child(${i}) h3:nth-child(1) a`).click();
                cy.get(`div[class='govuk-grid-column-one-third'] div:nth-child(2) h2:nth-child(1)`).should('exist');
                cy.get('.apollo-list--definition__value').eq(1)// 2nd instance of the selector
                    .invoke('text')
                    .then((text) => {
                        agreements.agreementArray.forEach((agreement) => {
                            if (text.includes(agreement.agreementID)) {
                                cy.log(`Verifying Key Facts of the Agreement: ${agreement.heading}!!!`);
                                cy.log(agreement.agreementID);
                                cy.log(agreement.startDate);
                                cy.get('.apollo-list--definition__value').eq(1).should('contain', agreement.agreementID);
                                cy.get('.apollo-list--definition__value').eq(2).should('contain', agreement.startDate);
                                cy.get('.apollo-list--definition__value').eq(5).should('contain', " PCR2015");
                                cy.get('.apollo-list--definition__value').eq(6).should('contain', " Dynamic Purchasing System");
                            }
                        })
                    })
                cy.visit(AGREEMENTS_URL);
                // cy.go('back');
                // cy.go(-1, { timeout: 120000 });
                //  cy.visit(Cypress.env("urlWithFilters"));
            }
            // *** Singular values
            // cy.get(`div.hideWithoutJS li:nth-child(1) h3:nth-child(1) a`).click();
            // cy.get(`div[class='govuk-grid-column-one-third'] div:nth-child(2) h2:nth-child(1)`).should('exist');
            // cy.get('.apollo-list--definition__value').eq(1).should('contain', " RM6095");
            // cy.get('.apollo-list--definition__value').eq(2).should('contain', " 24/09/2019");
            // cy.get('.apollo-list--definition__value').eq(5).should('contain', " PCR2015");
            // cy.get('.apollo-list--definition__value').eq(6).should('contain', " Dynamic Purchasing System");
            // ***for loop***
        });
    });
})
