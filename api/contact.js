export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { name, email, subject, message, honeypot } = body || {};
  console.log("BODY:", body);
  console.log("ENV:", {
    url: process.env.SUPABASE_URL,
    key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    resend: !!process.env.RESEND_API_KEY,
  });
  // Spam protection
  if (honeypot) {
    return res.status(200).json({ success: true });
  }

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Save to Supabase
    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/contact_messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name, email, subject, message }),
      }
    );

    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error("Supabase error:", err);

      return res.status(500).json({ error: "Database error" });
    }

    // Send email (Resend)
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Contact Form <noreply@playlostorbit.eu>",
        to: process.env.CONTACT_EMAIL,
        subject: `[Contact] ${subject}`,
        html: `
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      console.error("Email error:", await emailRes.text());
    }

    // Success
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}