export function load({ setHeaders }) {
  setHeaders({
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
  });
}
