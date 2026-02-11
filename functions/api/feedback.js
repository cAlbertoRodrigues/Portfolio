export async function onRequestPost({ request, env }) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = {
      parent: { database_id: env.NOTION_DATABASE_ID },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Email: { email },
        Subject: { rich_text: [{ text: { content: subject } }] },
        Message: { rich_text: [{ text: { content: message } }] },
      },
    };

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NOTION_API_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(payload),
    });

    if (!notionRes.ok) {
      const details = await notionRes.text();
      return new Response(JSON.stringify({ error: "Notion error", details }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
