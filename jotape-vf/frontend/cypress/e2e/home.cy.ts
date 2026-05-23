import { paths } from "../../src/cypress/paths";

describe("home", () => {
  it("loads marketing hero", () => {
    cy.visit(paths.home);
    cy.get('[data-testid="home-hero"]').should(
      "contain.text",
      "Encuentra tu talla perfecta",
    );
    cy.get('[data-testid="home-hero"]').should(
      "contain.text",
      "AI POWERED FITTING",
    );
    cy.get('[data-testid="home-hero"]').should("contain.text", "Probar IA");
    cy.get('[data-testid="home-hero-trust"]').should(
      "contain.text",
      "Compra segura",
    );
  });
});
