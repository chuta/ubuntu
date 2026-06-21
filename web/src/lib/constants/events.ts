import type { EventType, LeadQuality, UbuntuRole } from "@/types/events";

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "CONFERENCE", label: "Conference" },
  { value: "ROUNDTABLE", label: "Roundtable" },
  { value: "EXECUTIVE_MEETING", label: "Executive Meeting" },
  { value: "GOVERNMENT_BRIEFING", label: "Government Briefing" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "WEBINAR", label: "Webinar" },
  { value: "INTERNAL", label: "Internal" },
  { value: "OTHER", label: "Other" },
];

export const UBUNTU_ROLES: { value: UbuntuRole; label: string }[] = [
  { value: "SPEAKER", label: "Speaker" },
  { value: "SPONSOR", label: "Sponsor" },
  { value: "EXHIBITOR", label: "Exhibitor" },
  { value: "ATTENDEE", label: "Attendee" },
  { value: "HOST", label: "Host" },
];

export const LEAD_QUALITIES: { value: LeadQuality; label: string }[] = [
  { value: "HOT", label: "Hot" },
  { value: "WARM", label: "Warm" },
  { value: "COLD", label: "Cold" },
];

export function leadQualityVariant(q: LeadQuality) {
  switch (q) {
    case "HOT": return "red" as const;
    case "WARM": return "gold" as const;
    default: return "default" as const;
  }
}

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
