describe('This suite is to test the search and filter capability', () => {

    it('Happy Path - Search and filter', () => {
        cy.visit("https://www.crowncommercial.gov.uk/");
        cy.get('.gtm--accept-cookies-in-banner').click()
        cy.get('#framework_q').type('Digital');
        cy.get(".homepage-hero__search-button").eq(0).click();
        // cy.get(".homepage-hero__search-button").first().click();
        cy.get('.govuk-heading-m > span').should('contain', 'agreements found');
        cy.get('#PCR2015', { timeout: 1000 }).scrollIntoView();
        cy.get('[type="checkbox"]').eq(22).click();
        // // cy.waitUntil(() =>
        // //     cy.window().then((win) => win.document.readyState === 'complete')
        // );
    });
})
