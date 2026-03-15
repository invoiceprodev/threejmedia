import { env } from "@/lib/env";

export function getWhatsAppUrl(message?: string) {
  if (!env.whatsapp.number) {
    return "";
  }

  const text = encodeURIComponent(message || env.whatsapp.message);
  return `https://wa.me/${env.whatsapp.number}?text=${text}`;
}
