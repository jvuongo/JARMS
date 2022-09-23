
describe("Meetic Happy Path", () => {
  before(() => {
    cy.visit("http://localhost:3000");
  });

  it("Should be on login page.", () => {
    cy.get("h1").contains("Login").should("exist");
    cy.dataCy("Sign in").should("have.class", "opacity-1");
  });

  it("Input login details", () => {
    cy.dataCy("email-input").type("joemeetic@outlook.com")
    cy.dataCy("password-input").type("Joemama2")

    cy.dataCy("login-button").click()
    cy.dataCy("loading-redirect").should("exist");
  });

  it("Should be on homepage", () => {
    cy.get("h1").contains("Popular").should("exist");

    // Under popular there should be several cards for events with pictures and a title
    cy.get(".card").should("have.length.greaterThan", 0);
    cy.get(".card").each(($el, index, $list) => {
      cy.wrap($el).find("img").should("exist");
      cy.wrap($el).find("h3").should("exist");
    });

    // There should be a button to create an event
    cy.dataCy("create-event-button").should("exist");

    // A header should exist with the name of the user
    cy.dataCy("header").should("exist");
    cy.dataCy("header").contains("Joe Mama");

    // Header should also have users profile picture
    cy.dataCy("profile-picture").should("exist");

  });

  it("Should be able to view an event", () => {
    // Click on event with Shrek the Musical as title
    cy.get(".card").contains("Shrek the Musical").click();

    // Should be on a route with event/id
    cy.url().should("include", "/event/");

    // Should have a title
    cy.get("h1").contains("Shrek the Musical").should("exist");

    // Should have a description, date and image
    cy.get("p").contains("Shrek is a musical about a shrek.").should("exist");
    cy.get("img").should("exist");
    cy.get("h3").contains("Start Date:").should("exist");

    // Should have a button to join event
    cy.dataCy("join-event-button").should("exist");

    // Click on book button
    cy.dataCy("join-event-button").click();

    // A popover should show up
    cy.dataCy("popover").should("exist");

    // Click yes on the popover
    cy.dataCy("yes-button").click();

    // There should be a modal with the text "View ticket"
    cy.dataCy("modal").should("exist");

    // Click on it
    cy.dataCy("modal-button").click();

    // A ticket with the event details for Shrek the musical should exist
    cy.dataCy("ticket").should("exist");
    cy.dataCy("ticket").contains("Shrek the Musical").should("exist");
    cy.dataCy("ticket").contains("Shrek is a musical about a shrek.").should("exist");
    cy.dataCy("ticket").contains("Start Date:").should("exist");
    


  });


 

});

export {};
