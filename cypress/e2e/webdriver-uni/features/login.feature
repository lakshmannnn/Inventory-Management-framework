@regression
Feature: Webdriver Login page

    Scenario: Login using valid credentials
        Given I access Webdriver Uni login portal page
        When I enter username webdriver
        And enter valid password webdriver123
        And I click on Login button
        Then I should be presented with validation succeeded

    @login
    Scenario Outline: Login using data driven
        Given I access Webdriver Uni login portal page
        When I enter username <username>
        And enter valid password <password>
        And I click on Login button
        Then I should be presented with validation succeeded

        Examples:
            | username   | password      | message              |
            | webdriver  | webdriver123  | validation succeeded |
            | webdriver1 | webdriver1234 | validation failed    |