export function GET() {
  const _headers = {
    "/*": {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  };

  return new Response(
    Object.entries(_headers)
      .map(([path, headers]) =>
        [
          path,
          Object.entries(headers).map(([key, value]) => `    ${key}: ${value}`),
        ]
          .flat()
          .join("\n")
      )
      .join("\n\n")
  );
}

export const prerender = true;
