/**
 * Rutas compartidas por Cypress (E2E) y la app.
 */
export const paths = {
  home: "/",
  catalog: "/catalog",
  tryOn: "/try-on",
  cart: "/cart",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/success",
  product: (slug: string) => `/product/${slug}`,
} as const;
