//**Basic auth
cy.request('GET', '../..', { username: user123, pwd: pwd123 });
//OR
cy.request({
    method: 'GET',
    url: '/login',
    auth: { username: user123, password: pwd123 }
}).then((response) => {
    expect(response.status).to.eq(200);
})
//OR
// cy.request({
//     method: 'GET',
//     url: '/login',
//     headers: { Authorization: 'Basic `btoa(Cypress.env('username')+':'+ Cypress.env('pwd')`) }
// }).then((response) => {
//     expect(response.status).to.eq(200);
// })
// **Bearer key
cy.request({
    method: 'GET',
    url: '/login',
    headers: { Authorization: 'Bearer ${Cypress.env(token)}' }
}).then((response) => {
    expect(response.status).to.eq(200);
})

//**API key auth
cy.request({
    method: 'GET',
    url: '/login',
    headers: {
        'x-api-key': Cypress.env('APIKey')
        //OR headers: { api_key_name: api_key_value)
    }
}).then((response) => {
    expect(response.status).to.eq(200);
})


//**JWT
cy.request({
    method: 'POST',
    url: '/login',
    body: { username: Cypress.env('userName'), pwd: Cypress.env('pwd') },
}).then((response) => {
    Cypress.env('token', response.body.token);
    request({
        method: 'GET',
        url: '/',
        headers: {
            Authorization: `Bearer Cypress.env('token')`,
        }
    }).then((res) => {
        expect(res.status).to.eq(200);
    })
})

//**Auth2.0
cy.request({
    method: 'POST',
    url: '/login',
    body: { client_Id: Cypress.env('id'), client_secret: Cypress.env('secret'),grant_type: Cypress.env('type') },
}).then((response) => {
    Cypress.env('token', response.body.token);
    request({
        method: 'GET',
        url: '/',
        headers: {
            Authorization: `Bearer ${Cypress.env('token')}`
        }
    }).then((res) => {
        expect(res.status).to.eq(200);
    })
})

//Login via API instead of UI

cy.request({
    method: 'GET',
    url: '/login',
    auth: { username: user123, password: pwd123 }
}).then((response) => {
    Cypress.env('token', response.token),
    cy.visit('/', {onBeforeLoad(browser){browser.localStorage.setItem('token', Cypress.env('token') )}})
})

//Array

const bodyArray = [{user:user123,pwd:pwd123},{user:user345,pwd:pwd345}]

bodyArray.forEach((item)=>{
    const users = new Array();
    users.push(item.user);
    cy.log("users");
})
