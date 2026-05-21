import { paths } from "../../src/cypress/paths";

describe("home", () => {
  it("loads marketing hero", () => {
    cy.visit(paths.home);
    cy.get('[data-testid="home-hero"]').should("contain.text", "Huancayo");
  });
});
