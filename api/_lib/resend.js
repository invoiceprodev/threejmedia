function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeRecipients(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function sendResendEmail({ apiKey, from, to, subject, html, replyTo }) {
  if (!apiKey || !from || !to || to.length === 0) {
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) ? payload.errors.map((error) => error?.message).filter(Boolean).join(", ") : "") ||
      "Unable to send email with Resend.";
    throw new Error(message);
  }

  return payload;
}

export async function sendBudgetQuoteEmails({
  resendApiKey,
  resendFromEmail,
  internalRecipients,
  quote,
}) {
  const recipients = normalizeRecipients(internalRecipients);
  const {
    name,
    email,
    websiteTypeName,
    addonNames,
    hostingPlanName,
    domainOptionName,
    onceOffTotal,
    monthlyTotal,
    yearlyTotal,
  } = quote;

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeWebsiteTypeName = escapeHtml(websiteTypeName);
  const safeHostingPlanName = escapeHtml(hostingPlanName);
  const safeDomainOptionName = escapeHtml(domainOptionName);
  const safeAddonNames =
    addonNames.length > 0 ? addonNames.map((item) => `<li>${escapeHtml(item)}</li>`).join("") : "<li>No add-ons selected</li>";

  await Promise.allSettled([
    sendResendEmail({
      apiKey: resendApiKey,
      from: resendFromEmail,
      to: [email],
      replyTo: recipients[0] || undefined,
      subject: "We received your Three J Media budget request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 16px;">Thanks, ${safeName}</h2>
          <p>We received your custom website budget request and our team will review it shortly.</p>
          <p><strong>Website:</strong> ${safeWebsiteTypeName}</p>
          <p><strong>Hosting:</strong> ${safeHostingPlanName}</p>
          <p><strong>Domain:</strong> ${safeDomainOptionName}</p>
          <p><strong>One-off total:</strong> R${Number(onceOffTotal).toLocaleString("en-ZA")}</p>
          <p><strong>Monthly total:</strong> R${Number(monthlyTotal).toLocaleString("en-ZA")}/mo</p>
          <p><strong>Annual domain total:</strong> R${Number(yearlyTotal).toLocaleString("en-ZA")}/yr</p>
          <p><strong>Add-ons:</strong></p>
          <ul>${safeAddonNames}</ul>
          <p>We will be in touch on ${safeEmail} within 24 hours.</p>
        </div>
      `,
    }),
    sendResendEmail({
      apiKey: resendApiKey,
      from: resendFromEmail,
      to: recipients,
      replyTo: email,
      subject: `New budget quote request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin-bottom: 16px;">New budget quote request</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Website:</strong> ${safeWebsiteTypeName}</p>
          <p><strong>Hosting:</strong> ${safeHostingPlanName}</p>
          <p><strong>Domain:</strong> ${safeDomainOptionName}</p>
          <p><strong>One-off total:</strong> R${Number(onceOffTotal).toLocaleString("en-ZA")}</p>
          <p><strong>Monthly total:</strong> R${Number(monthlyTotal).toLocaleString("en-ZA")}/mo</p>
          <p><strong>Annual domain total:</strong> R${Number(yearlyTotal).toLocaleString("en-ZA")}/yr</p>
          <p><strong>Add-ons:</strong></p>
          <ul>${safeAddonNames}</ul>
        </div>
      `,
    }),
  ]).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("[resend] budget quote email failed", {
          message: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    }
  });
}
