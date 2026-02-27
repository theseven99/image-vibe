import { Card } from "../ui/card";

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode,
  title: string,
  description: string,
}) {
  return (
    <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}