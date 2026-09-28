@now-assist
Feature: Now Assist Skills Panel

  As a ServiceNow user
  I want to open the Now Assist panel
  So that I can see what AI-powered skills are available to me

  Background:
    Given I am logged in to ServiceNow
    And I am on the Next Experience home page

  Scenario: View all available Now Assist skills
    When I open the Now Assist skill picker
    Then I should see at least 1 skill available
    And the available skills should be written to a file

  Scenario: Verify specific skills are present
    When I open the Now Assist skill picker
    Then the skill "Generate resolution notes" should be visible
    And the skill "Summarize a record" should be visible
    And the skill "Incident assist" should be visible
