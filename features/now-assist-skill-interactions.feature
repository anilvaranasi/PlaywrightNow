@now-assist @skills
Feature: Now Assist Individual Skill Interactions
  As a ServiceNow user
  I want to interact with each Now Assist skill
  So that I can verify each AI-powered action launches correctly

  Background:
    Given I am logged in to ServiceNow
    And I am on the Next Experience home page
    And I open the Now Assist skill picker

  # ── Skill 1 ─────────────────────────────────────────────────────────────
  Scenario: Get Help skill launches and accepts a question
    When I click the Now Assist skill "Get Help"
    Then the Now Assist chat input should be visible
    When I type "How do I create an incident?" in the chat
    Then the message is accepted by Now Assist

  # ── Skill 2 ─────────────────────────────────────────────────────────────
  Scenario: Summarize a record skill launches
    When I click the Now Assist skill "Summarize a record"
    Then the Now Assist chat input should be visible

  # ── Skill 3 ─────────────────────────────────────────────────────────────
  Scenario: Summarize conversation skill launches
    When I click the Now Assist skill "Summarize conversation"
    Then the Now Assist chat input should be visible

  # ── Skill 4 ─────────────────────────────────────────────────────────────
  Scenario: Generate resolution notes skill launches
    When I click the Now Assist skill "Generate resolution notes"
    Then the Now Assist chat input should be visible

  # ── Skill 5 ─────────────────────────────────────────────────────────────
  Scenario: generate a kb article skill launches
    When I click the Now Assist skill "generate a kb article"
    Then the Now Assist chat input should be visible

  # ── Skill 6 ─────────────────────────────────────────────────────────────
  Scenario: Incident assist skill launches
    When I click the Now Assist skill "Incident assist"
    Then the Now Assist chat input should be visible

  # ── Skill 7 ─────────────────────────────────────────────────────────────
  Scenario: Manage duplicate CIs skill launches
    When I click the Now Assist skill "Manage duplicate CIs"
    Then the Now Assist chat input should be visible

  # ── Skill 8 ─────────────────────────────────────────────────────────────
  Scenario: Error Analysis and Remediation Workflow skill launches
    When I click the Now Assist skill "Error Analysis and Remediation Workflow"
    Then the Now Assist chat input should be visible

  # ── Skill 9 ─────────────────────────────────────────────────────────────
  Scenario: Suggest configuration items for a change request skill launches
    When I click the Now Assist skill "Suggest configuration items for a change request"
    Then the Now Assist chat input should be visible
