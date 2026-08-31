import { useAppStore } from '@/store/app-store';

export function OrdersTab() {
  const { orders } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Orders & Payments</h1>
        <p className="text-sm text-muted-foreground">Track registration payments processed via Razorpay.</p>
      </div>

      <div className="border border-foreground/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground font-semibold border-b border-foreground/10">
              <th className="p-4">Order ID</th>
              <th className="p-4">Delegate</th>
              <th className="p-4">Category</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] last:border-0">
                <td className="p-4 font-mono text-xs text-muted-foreground">{o.orderId}</td>
                <td className="p-4">
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-xs text-muted-foreground">{o.email}</div>
                </td>
                <td className="p-4 text-xs font-bold text-accent">{o.category}</td>
                <td className="p-4 font-mono font-semibold">₹{(o.amount / 100).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    o.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                    o.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No payment orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
