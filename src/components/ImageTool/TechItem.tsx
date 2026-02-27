import { ArrowLeft } from "lucide-react";

export default function TechItem({ label, href }: { label: string, href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all group"
    >
      <span className="text-sm font-semibold">{label}</span>
      <ArrowLeft className="w-3 h-3 rotate-135 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}