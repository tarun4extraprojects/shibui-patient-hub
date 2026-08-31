import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Tells the UI whether WhatsApp credentials are configured on the server. */
export const getWhatsAppStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { isWhatsAppConfigured } = await import("@/services/whatsappService.server");
    return { configured: isWhatsAppConfigured() };
  });

/** Sends one stored reminder over WhatsApp and records the real outcome. */
export const sendReminderNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { reminderId: string }) => {
    if (!data?.reminderId) throw new Error("reminderId is required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: reminder, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("id", data.reminderId)
      .maybeSingle();
    if (error) throw error;
    if (!reminder) throw new Error("Reminder not found");

    if (reminder.status === "sent") {
      return { configured: true, ok: true, alreadySent: true };
    }

    const { sendWhatsAppText } = await import("@/services/whatsappService.server");
    const result = await sendWhatsAppText(
      reminder.recipient_phone as string,
      reminder.message as string,
    );

    if (!result.configured) {
      await supabase
        .from("reminders")
        .update({
          status: "failed",
          error_message: "WhatsApp integration not configured",
          delivery_status: "not_configured",
        })
        .eq("id", reminder.id);
      return { configured: false, ok: false, alreadySent: false };
    }

    await supabase
      .from("reminders")
      .update(
        result.ok
          ? {
              status: "sent",
              sent_at: new Date().toISOString(),
              delivery_status: result.providerId ? `accepted:${result.providerId}` : "accepted",
              error_message: null,
            }
          : { status: "failed", delivery_status: "error", error_message: result.error ?? "Unknown error" },
      )
      .eq("id", reminder.id);

    return { configured: true, ok: result.ok, alreadySent: false, error: result.error };
  });
