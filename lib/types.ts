export type Stage =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employees: number;
  city: string;
  arr: number; // annual recurring revenue
  logoColor: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyId: string;
  avatarColor: string;
  city: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  companyId: string;
  ownerId: string;
  amount: number;
  stage: Stage;
  closeDate: string;
  probability: number;
}

export interface Activity {
  id: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  title: string;
  personId?: string;
  companyId?: string;
  when: string;
  done: boolean;
}
