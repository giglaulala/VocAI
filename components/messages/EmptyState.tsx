"use client";

import { MessageSquare, PlugZap } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: "messages" | "connect";
  action?: React.ReactNode;
}) {
  const Icon = icon === "connect" ? PlugZap : MessageSquare;
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

