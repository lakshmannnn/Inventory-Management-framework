// login to the website via API:
describe('tests', () => {
    it(() => {
        cy.request("POST", "../.../", credentials).its(body).then(body => {
            const token = body.authentication.token
            cy.wrap(token).as("userToken")
            cy.visit("url", { onBeforeLoad(browser) { browser.localStorage.setItem(token, '@userToken') } })
            //  below function would set the bearer key only after accessing the UI so above logic would be appropriate one.
            //  cy.window().then((win) => {
            //  win.sessionstorage.setItem("key",@userToken);
            //       })
            })
        })
    })