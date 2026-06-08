import { MailCheck, Send, Ban, Database } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { EmailBatch } from "@/components/email-batch";
import { loadContacts } from "@/lib/crm";
import { emailConfigured, emailFrom } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const { prospects, live } = await loadContacts();
  const configured = emailConfigured();
  const from = emailFrom();

  const emailable = prospects.filter((p) => p.email && !p.optOut);
  const optedOut = prospects.filter((p) => p.optOut).length;

  return (
    <div>
      <PageHeader
        title="Emails"
        subtitle="Envoi en lot (semi-automatique) par flux — personnalisé, journalisé, et respectant les opt-out."
        action={
          <span
            className="chip"
            style={{
              color: configured ? "#10b981" : "#f59e0b",
              background: configured ? "#10b9811a" : "#f59e0b1a",
            }}
          >
            <Send className="h-3 w-3" />
            {configured ? "Resend actif" : "Resend à configurer"}
          </span>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Contacts" value={prospects.length} icon={Database} color="#6366f1" />
        <Stat label="Avec email" value={emailable.length} icon={MailCheck} color="#10b981" />
        <Stat label="Opt-out" value={optedOut} icon={Ban} color="#ef4444" />
        <Stat
          label="Source"
          value={live ? "Live" : "—"}
          icon={Send}
          color="#06b6d4"
        />
      </div>

      <EmailBatch prospects={emailable} configured={configured} from={from} />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: typeof Database;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-white/10"
        style={{ background: `${color}22` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
