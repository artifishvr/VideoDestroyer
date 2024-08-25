export async function handle({ event, resolve }) {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html,
  });

  response.headers.set("Cross-Origin-Opener-Policy", "origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");

  return response;
}
