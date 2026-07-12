type RailStatus = "in-stock" | "low-stock" | "out-of-stock" | "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

const railColor: Record<RailStatus, string> = {
  "in-stock": "bg-success",
  "low-stock": "bg-warning",
  "out-of-stock": "bg-danger",
  pending: "bg-warning",
  paid: "bg-slate",
  shipped: "bg-signal",
  delivered: "bg-success",
  cancelled: "bg-danger",
  refunded: "bg-slate",
};

export default function StatusRail({ status, children }: { status: RailStatus; children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className={`w-[3px] shrink-0 rounded-full ${railColor[status]}`} />
      <div className="pl-4 flex-1">{children}</div>
    </div>
  );
}