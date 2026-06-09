// Shared registry of selectable email models, used by both the campaign email
// runner and the per-contact composer. Combines: rich HTML presets
// (lib/lexora-emails), the user's custom email models (DB crm_templates), and
// the built-in per-channel text templates (lib/templates). Pure/client-safe.

import { emailPresets } from "./lexora-emails";
import { emailTemplates } from "./templates";
import { channelMeta, type Channel } from "./prospects";

export type EmailModel = {
  id: string;
  label: string;
  html: boolean;
  subject: string;
  body: string;
  htmlBody?: string;
};

export interface CustomEmailModel {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel?: string | null;
}

const presetLabels: Record<string, string> = {
  "lexora-presentation": "Présentation LEXORA — complète (HTML)",
};
export function presetLabel(key: string): string {
  return presetLabels[key] ?? key;
}

export function buildEmailModels(custom: CustomEmailModel[] = []): EmailModel[] {
  const presets: EmailModel[] = Object.entries(emailPresets).map(([k, p]) => ({
    id: `preset:${k}`,
    label: presetLabel(k),
    html: true,
    subject: p.subject,
    body: p.text,
    htmlBody: p.html,
  }));
  const customModels: EmailModel[] = custom.map((c) => ({
    id: `custom:${c.id}`,
    label: `★ ${c.name}`,
    html: false,
    subject: c.subject,
    body: c.body,
  }));
  const texts: EmailModel[] = (Object.keys(emailTemplates) as Channel[]).flatMap(
    (ch) =>
      emailTemplates[ch].map((t) => ({
        id: `text:${t.id}`,
        label: `${t.name} · ${channelMeta[ch].label}`,
        html: false,
        subject: t.subject,
        body: t.body,
      }))
  );
  return [...presets, ...customModels, ...texts];
}
