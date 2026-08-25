import { useSyncExternalStore } from "react";

export type Task = {
  id: string;
  action: string;
  owner: string;
  deadline: string;
  status: "Not started" | "In progress" | "Completed";
  priority: "High" | "Medium" | "Low";
  source: string;
};

const KEY = "sd-assist-tasks";

const seed: Task[] = [
  {
    id: "t1",
    action: "Submit Q2 ECD subsidy compliance report to Provincial Office",
    owner: "T. Mokoena",
    deadline: "2026-08-27",
    status: "In progress",
    priority: "High",
    source: "Report submissions",
  },
  {
    id: "t2",
    action: "Respond to NPO funding query from Ubuntu Care Centre",
    owner: "P. Booi",
    deadline: "2026-08-25",
    status: "Not started",
    priority: "High",
    source: "Email follow-up",
  },
  {
    id: "t3",
    action: "Collect outstanding attendance registers from three service points",
    owner: "N. Dlamini",
    deadline: "2026-08-24",
    status: "Not started",
    priority: "High",
    source: "Monitoring visit",
  },
  {
    id: "t4",
    action: "Circulate minutes of the Stakeholder Forum meeting",
    owner: "P. Booi",
    deadline: "2026-08-28",
    status: "In progress",
    priority: "Medium",
    source: "Meeting actions",
  },
  {
    id: "t5",
    action: "Update Substance Abuse Awareness project plan with revised dates",
    owner: "M. Naidoo",
    deadline: "2026-09-02",
    status: "Not started",
    priority: "Medium",
    source: "Programme tracker",
  },
  {
    id: "t6",
    action: "Prepare venue logistics checklist for community engagement day",
    owner: "S. Khumalo",
    deadline: "2026-09-05",
    status: "Completed",
    priority: "Low",
    source: "Checklist generator",
  },
];

let tasks: Task[] = seed;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      tasks = JSON.parse(raw) as Task[];
      emit();
    }
  } catch {
    /* ignore */
  }
}

function subscribe(l: () => void) {
  hydrate();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTasks() {
  return useSyncExternalStore(
    subscribe,
    () => tasks,
    () => seed,
  );
}

export function addTasks(items: Omit<Task, "id">[]) {
  tasks = [
    ...items.map((t, i) => ({ ...t, id: `${Date.now()}-${i}` })),
    ...tasks,
  ];
  persist();
  emit();
}

export function updateTask(id: string, patch: Partial<Task>) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
  persist();
  emit();
}

export function removeTask(id: string) {
  tasks = tasks.filter((t) => t.id !== id);
  persist();
  emit();
}
