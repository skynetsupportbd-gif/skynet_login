// netlify/functions/tg-poll.js
//
// লাইভ চ্যাট থেকে অ্যাডমিনের রিপ্লাই পোল করার প্রক্সি।
// Bot token client-side এ কখনো যায় না — শুধু এখানে, env var থেকে পড়া হয়।

exports.handler = async (event) => {
  const offset =
    (event.queryStringParameters && event.queryStringParameters.offset) || "0";

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, description: "Server misconfiguration: missing env vars" }),
    };
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${encodeURIComponent(offset)}&timeout=0`
    );
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
