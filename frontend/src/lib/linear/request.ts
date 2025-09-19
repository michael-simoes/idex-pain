export default async function linearRequest<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  // The Linear API key **must** be exposed to the browser because this code runs client-side.
  // The project already uses the prefix EXPO_PUBLIC_ for public variables, which is safe in Expo / Next.js.
  const apiKey =
    process.env.NEXT_PUBLIC_LINEAR_API_KEY || process.env.EXPO_PUBLIC_LINEAR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Linear API key is missing. Add NEXT_PUBLIC_LINEAR_API_KEY (or EXPO_PUBLIC_LINEAR_API_KEY) to your .env file."
    );
  }

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "<no body>");
    throw new Error(`Linear request failed: ${res.status} ${res.statusText} – ${body}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(
      `Linear error: ${json.errors.map((e: { message: string }) => e.message).join(", ")} | variables: ${JSON.stringify(variables)}`
    );
  }

  return json.data;
}
