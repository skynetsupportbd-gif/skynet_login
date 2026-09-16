// netlify/functions/tg-send.js
//
// লাইভ চ্যাট থেকে ইউজারের মেসেজ Telegram-এ পাঠানোর প্রক্সি।
// Bot token client-side এ কখনো যায় না — শুধু এখানে, env var থেকে পড়া হয়।

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, description: "Method Not Allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, description: "Invalid JSON body" }),
    };
  }

  const { text } = payload;
  if (!text) {
    return {
      statusCode: 422,
      body: JSON.stringify({ ok: false, description: "Missing text" }),
    };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, description: "Server misconfiguration: missing env vars" }),
    };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, description: "Failed to reach Telegram: " + err.message }),
    };
  }
};
