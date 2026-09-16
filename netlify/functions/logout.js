// netlify/functions/logout.js
//
// ইউজারকে ম্যানুয়ালি লগআউট/ডিসকানেক্ট করাতে চাইলে (ঐচ্ছিক)

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  const { ga_ap_mac, ga_cmac, ga_Qv, ga_user, ga_pass } = payload;

  if (!ga_ap_mac || !ga_cmac || !ga_Qv) {
    return {
      statusCode: 422,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  const SECRET_KEY = process.env.CAMBIUM_SECRET_KEY;
  const BASE_URL = process.env.CAMBIUM_BASE_URL;

  if (!SECRET_KEY || !BASE_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfiguration: missing env vars" }),
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/easypass/external-portal/logout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ga_ap_mac, ga_cmac, ga_Qv, ga_user, ga_pass }),
      }
    );

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to reach cnMaestro", details: err.message }),
    };
  }
};
