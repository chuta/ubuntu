export type EventType =
  | "CONFERENCE"
  | "ROUNDTABLE"
  | "EXECUTIVE_MEETING"
  | "GOVERNMENT_BRIEFING"
  | "WORKSHOP"
  | "WEBINAR"
  | "INTERNAL"
  | "OTHER";

export type UbuntuRole = "SPEAKER" | "SPONSOR" | "EXHIBITOR" | "ATTENDEE" | "HOST";

export type LeadQuality = "HOT" | "WARM" | "COLD";

export type FollowUpStatus = "PENDING" | "CONTACTED" | "CONVERTED" | "DISCARDED";

export type Event = {
  id: string;
  name: string;
  event_type: EventType;
  start_date: string;
  end_date: string | null;
  location: string | null;
  country_code: string | null;
  territory_id: string | null;
  description: string | null;
  budget: number | null;
  actual_cost: number | null;
  ubuntu_role: UbuntuRole | null;
  owner_id: string;
  roi_notes: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
  territory?: { id: string; name: string } | null;
};

export type EventLead = {
  id: string;
  event_id: string;
  contact_id: string | null;
  organization_id: string | null;
  deal_id: string | null;
  lead_quality: LeadQuality | null;
  follow_up_status: FollowUpStatus;
  notes: string | null;
  created_at: string;
  contact?: { id: string; first_name: string; last_name: string } | null;
  organization?: { id: string; name: string } | null;
  deal?: { id: string; name: string } | null;
};
