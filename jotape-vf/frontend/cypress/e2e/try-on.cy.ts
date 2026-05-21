import { paths } from "../../src/cypress/paths";

describe("try-on", () => {
  it("loads 3D fitting room and switches gender and size", () => {
    cy.visit(paths.tryOn);
    cy.contains("Probador virtual JotaPe", { matchCase: false });
    cy.contains("Avatar 3D", { matchCase: false });
    cy.get('[aria-label="Tipo de avatar"]').first().within(() => {
      cy.contains("button", "Hombre").click();
    });
    cy.contains("button", "L").click();
    cy.get("canvas", { timeout: 20000 }).should("exist");
  });
});
