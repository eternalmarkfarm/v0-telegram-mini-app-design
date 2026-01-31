import type { PrizeData } from "@/app/prom/components/PrizeCard";

export const formatPrizeTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", "");
};

export const mapPrizeStatus = (status?: string | null): PrizeData["status"] => {
  if (status === "success") return "received";
  if (status === "not_claimed" || status === "failed") return "missed";
  if (status === "sent") return "sent";
  return "processing";
};
