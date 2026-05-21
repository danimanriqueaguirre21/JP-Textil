import { paths } from "../../src/cypress/paths";

describe("checkout", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit(paths.product("polera-oversize-negra"));
    cy.get('[data-testid="add-to-cart"]').click();
  });

  it("completes checkout flow", () => {
    cy.get('[data-testid="go-checkout"]').click();
    cy.url().should("include", paths.checkout);
    cy.get('[data-testid="checkout-total"]').should("exist");
    cy.get('[data-testid="checkout-name"]').clear().type("Ana Pérez");
    cy.get('[data-testid="checkout-email"]').clear().type("ana@jotape.pe");
    cy.get('[data-testid="checkout-submit"]').click();
    cy.url().should("include", paths.checkoutSuccess);
    cy.get('[data-testid="checkout-success"]').should(
      "contain",
      "Pedido confirmado",
    );
  });
});
