export type VisitKind = "login" | "visit";

export type SiteVisit = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  at: string;
  kind: VisitKind;
};

export type VisitorSummary = {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  firstSeen: string;
  lastSeen: string;
  logins: number;
  visits: number;
};
