import { Employee } from "@/types";

type AvailabilityConfig = { label: string; style: string };

const config: Record<
  NonNullable<Employee["availability"]>,
  AvailabilityConfig
> = {
  "on-leave": {
    label: "🟡 İzinde / On Leave",
    style:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  "on-break": {
    label: "🍽️ Molada / On Break",
    style:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  available: {
    label: "🟢 Müsait / Available",
    style:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  "off-hours": {
    label: "⚫ Çalışma dışı / Off Hours",
    style: "bg-gray-100 text-gray-500 dark:bg-clay-700 dark:text-bronze-200/60",
  },
};

export default function AvailabilityBadge({
  availability,
}: {
  availability?: Employee["availability"];
}) {
  if (!availability)
    return <span className="text-clay-700/40 dark:text-bronze-200/30">—</span>;
  const { label, style } = config[availability];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
