// Reading res.json() directly throws an uncaught SyntaxError if the body is
// empty or malformed (a dev-server hot-reload cutting a request short, a
// server error that didn't produce JSON, etc). That uncaught throw skips
// past any setLoading(false) that comes after it, leaving buttons stuck on
// "loading" forever with no visible error. This reads the body as text
// first and parses it safely, always returning something usable.
export async function safeJson(res: Response): Promise<any> {
  const raw = await res.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Server sent back an invalid response. Please try again.");
  }
}
