/**
 * WhatsApp integration layer (server-only).
 *
 * Uses the official WhatsApp Cloud API (Meta). Credentials come from
 * environment variables and are NEVER exposed to the browser:
 *   WHATSAPP_ACCESS_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_BUSINESS_ACCOUNT_ID (optional, for template management)
 *
 * If credentials are missing nothing is faked — the caller receives
 * { configured: false } and the UI shows "WhatsApp integration not configured".
 */

export interface WhatsAppResult {
  configured: boolean;
  ok: boolean;
  providerId?: string;
  error?: string;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env["WHATSAPP_ACCESS_TOKEN"] && process.env["WHATSAPP_PHONE_NUMBER_ID"]);
}

/** Convert a local Indian number to E.164 digits expected by the Cloud API. */
function toE164(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export async function sendWhatsAppText(phone: string, message: string): Promise<WhatsAppResult> {
  const token = process.env["WHATSAPP_ACCESS_TOKEN"];
  const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];

  if (!token || !phoneNumberId) {
    return { configured: false, ok: false, error: "WhatsApp integration not configured" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toE164(phone),
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error(`WhatsApp send failed [${res.status}]: ${body}`);
      return { configured: true, ok: false, error: `[${res.status}] ${body}` };
    }
    const json = JSON.parse(body) as { messages?: { id: string }[] };
    return { configured: true, ok: true, providerId: json.messages?.[0]?.id };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("WhatsApp send error:", error);
    return { configured: true, ok: false, error };
  }
}
