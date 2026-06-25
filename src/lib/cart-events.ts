export const CART_CHANGED_EVENT = "cart:changed";
export const CART_CHANGED_STORAGE_KEY = "mybox-cart-changed-at";

export const notifyCartChanged = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));

  try {
    window.localStorage.setItem(CART_CHANGED_STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage pode estar indisponível em alguns contextos; o evento da aba atual já foi emitido.
  }
};