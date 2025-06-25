import { Before, Given, When, And, Then } from "cypress-cucumber-preprocessor/steps";
let stub;
Before(()=>{
    cy.log("executing before hook!");
     stub = cy.stub();
})

Given('I access Webdriver Uni login portal page', ()=>{
cy.visit("https://www.webdriveruniversity.com/Login-Portal/index.html");
})

When("I enter username {word}",(username)=>{
cy.get('#text').type(username)
})

And("enter valid password {word}",(password)=>{
cy.get('#password').type(password);
})

And("I click on Login button",()=>{
cy.get('#login-button').click();
})

Then("I should be presented with {word} {word}", (message1,message2)=>{
 const expectedMessage = message1 + ' ' + message2 ;
 cy.log(expectedMessage)
 cy.log(stub.getCall(0));
 expect(stub.getCall(0)).to.be.calledWith(expectedMessage);
})
