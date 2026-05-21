import { paths } from "../../src/cypress/paths";

describe("cart", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("adds a product and shows it in the cart", () => {
    cy.visit(paths.product("polera-oversize-negra"));
    cy.get('[data-testid="product-name"]').should("contain", "Polera Oversize Negra");
    cy.get('[data-testid="size-M"]').click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.url().should("include", paths.cart);
    cy.get('[data-testid="cart-page"]').should("exist");
    cy.get('[data-testid="cart-line-name"]').should("contain", "Polera Oversize Negra");
    cy.get('[data-testid="cart-subtotal"]').should("exist");
  });

  it("removes a line from the cart", () => {
    cy.visit(paths.product("polera-basica-blanca"));
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-remove"]').first().click();
    cy.get('[data-testid="cart-empty"]').should("be.visible");
  });
});
