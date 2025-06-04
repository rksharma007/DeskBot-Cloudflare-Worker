const AUTH_TOKEN = "deskbot";
const QUOTES_URL = "https://gist.githubusercontent.com/rksharma007/96b56c1604d8eee43bd9a27e8a454240/raw/deskbot_quotes.json";

const fallbackQuotes = [
  "Fallback ? : When the internet fails, you don’t. Keep shining!"
];

export default {
  async fetch(request) {
    const authHeader = request.headers.get("Authorization");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        }
      });
    }

    // Auth check
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        }
      });
    }

    // Try fetching quotes from Gist
    let quotes = fallbackQuotes;
    try {
      const res = await fetch(QUOTES_URL);
      if (res.ok) {
        quotes = await res.json();
      }
    } catch (e) {
      // Use fallback quotes silently
    }

    // Calculate quote index based on UTC time (every 5 minutes)
    const now = new Date();
    const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const index = Math.floor(totalMinutes / 5) % quotes.length;
    const quote = quotes[index];

    return new Response(JSON.stringify({ quote }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};