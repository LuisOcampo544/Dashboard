import { CheckCircle2 } from 'lucide-react'
import { money, formatAlertType, pct } from '../../lib/dashboardHelpers.js'

export default function AlertList({ overview, alerts, currency }) {
    const apiAlerts = alerts.alerts || []
    const derivedAlerts = overview.overBudgetCategories?.map((category) => ({ type: 'CATEGORY_BUDGET_EXCEEDED', category })) || []
    const items = apiAlerts.length ? apiAlerts : derivedAlerts

    if (!items.length) {
        return (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
                <p className="flex items-center gap-2 font-semibold text-[var(--heading)]"><CheckCircle2 size={18} /> Sin alertas críticas</p>
                <p className="mt-1 text-xs text-[var(--muted)]">El periodo se mantiene dentro de los límites configurados.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={`${item.type}-${item.category || index}`} className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="font-semibold text-[var(--heading)]">{formatAlertType(item.type)}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                        {item.category ? `${item.category}: ${money(item.currentAmount, currency)} de ${money(item.budgetedAmount, currency)}` : `Ratio actual: ${pct(item.expenseToIncomeRatio)}`}
                    </p>
                </div>
            ))}
        </div>
    )
}
