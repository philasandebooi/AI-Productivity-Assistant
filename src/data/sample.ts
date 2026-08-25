export const currentUser = {
  name: "Philasande",
  fullName: "Philasande A. Booi",
  role: "Programme Administration Officer",
  office: "Eastern Cape Provincial Office",
};

export type Programme = {
  id: string;
  name: string;
  objective: string;
  lead: string;
  deadline: string;
  progress: number;
  status: "On track" | "At risk" | "Delayed" | "Completed";
  alert: string;
  challenges: string;
  nextSteps: string;
};

export const programmes: Programme[] = [
  {
    id: "p1",
    name: "ECD Centre Registration Support",
    objective: "Support 40 unregistered ECD centres through the registration process",
    lead: "T. Mokoena",
    deadline: "2026-09-15",
    progress: 72,
    status: "On track",
    alert: "Two site verification reports outstanding",
    challenges: "Limited transport availability for site visits",
    nextSteps: "Finalise verification reports and schedule September visits",
  },
  {
    id: "p2",
    name: "Substance Abuse Awareness Campaign",
    objective: "Reach 12 schools with prevention awareness sessions",
    lead: "M. Naidoo",
    deadline: "2026-08-29",
    progress: 45,
    status: "At risk",
    alert: "Deadline in 4 days with 5 sessions unscheduled",
    challenges: "School calendar clashes and facilitator availability",
    nextSteps: "Confirm dates with district office and reallocate facilitators",
  },
  {
    id: "p3",
    name: "NPO Compliance Monitoring",
    objective: "Complete compliance monitoring of 25 funded NPOs",
    lead: "N. Dlamini",
    deadline: "2026-08-31",
    progress: 30,
    status: "Delayed",
    alert: "Overdue: 6 monitoring tools not submitted",
    challenges: "Outstanding financial documents from four NPOs",
    nextSteps: "Issue formal follow-up letters and set submission deadline",
  },
  {
    id: "p4",
    name: "Community Nutrition Development Centres",
    objective: "Strengthen reporting at 8 nutrition centres",
    lead: "S. Khumalo",
    deadline: "2026-10-10",
    progress: 88,
    status: "On track",
    alert: "No alerts",
    challenges: "None reported",
    nextSteps: "Consolidate quarterly statistics for provincial report",
  },
  {
    id: "p5",
    name: "Youth Development Skills Project",
    objective: "Place 60 youth participants in skills programmes",
    lead: "P. Booi",
    deadline: "2026-07-30",
    progress: 100,
    status: "Completed",
    alert: "Close-out report due",
    challenges: "None",
    nextSteps: "Submit close-out report to management",
  },
];

export type FollowUp = {
  id: string;
  item: string;
  category: "Email" | "Document" | "Meeting action" | "Deadline" | "Stakeholder" | "Report";
  due: string;
  urgency: "Overdue" | "Urgent" | "Upcoming";
  owner: string;
};

export const followUps: FollowUp[] = [
  { id: "f1", item: "Reply to Municipality request for programme statistics", category: "Email", due: "2026-08-23", urgency: "Overdue", owner: "P. Booi" },
  { id: "f2", item: "Outstanding financial statements from Ubuntu Care Centre", category: "Document", due: "2026-08-24", urgency: "Overdue", owner: "N. Dlamini" },
  { id: "f3", item: "Confirm attendance for District Coordination Meeting", category: "Meeting action", due: "2026-08-25", urgency: "Urgent", owner: "P. Booi" },
  { id: "f4", item: "Monthly programme performance report submission", category: "Report", due: "2026-08-28", urgency: "Urgent", owner: "T. Mokoena" },
  { id: "f5", item: "Follow up with SAPS on joint awareness campaign", category: "Stakeholder", due: "2026-09-01", urgency: "Upcoming", owner: "M. Naidoo" },
  { id: "f6", item: "Submit ECD verification reports to Provincial Office", category: "Deadline", due: "2026-09-04", urgency: "Upcoming", owner: "T. Mokoena" },
];

export const weeklyActivity = [
  { day: "Mon", completed: 6, created: 8 },
  { day: "Tue", completed: 9, created: 7 },
  { day: "Wed", completed: 5, created: 6 },
  { day: "Thu", completed: 8, created: 4 },
  { day: "Fri", completed: 4, created: 5 },
];

export const meetings = [
  { id: "m1", title: "District Coordination Meeting", date: "2026-08-26", actions: 5, status: "Follow-up required" },
  { id: "m2", title: "NPO Funding Review", date: "2026-08-21", actions: 3, status: "Actions assigned" },
  { id: "m3", title: "Stakeholder Forum: Community Safety", date: "2026-08-19", actions: 4, status: "Minutes outstanding" },
];
