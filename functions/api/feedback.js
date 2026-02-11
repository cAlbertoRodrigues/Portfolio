export async function onRequestPost({ request, env }) {
  try {
    const ct = request.headers.get("content-type") || "";
    let data = {};

    if (ct.includes("application/json")) {
      data = await request.json();
    } else if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const subject = String(data.subject || "").trim();
    const message = String(data.message || "").trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = env.NOTION_API_TOKEN || env.NOTION_TOKEN || env.NOTION_API_KEY;
    const databaseId = env.NOTION_DATABASE_ID;

    if (!token || !databaseId) {
      return new Response(
        JSON.stringify({
          error: "Missing env vars",
          missing: {
            NOTION_DATABASE_ID: !databaseId,
            NOTION_API_TOKEN_OR_NOTION_TOKEN: !token,
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = {
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: name } }] },
        Email: { email },
        Subject: { rich_text: [{ text: { content: subject || "No subject" } }] },
        Message: { rich_text: [{ text: { content: message } }] },
      },
    };

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(payload),
    });

    const text = await notionRes.text();

    if (!notionRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Notion error",
          status: notionRes.status,
          details: text,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", details: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
