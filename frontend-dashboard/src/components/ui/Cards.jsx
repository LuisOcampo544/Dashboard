import { Pencil, Trash2 } from 'lucide-react'
import { pct, toDateInput, money } from '../../lib/dashboardHelpers.js'

export function StatCard({ icon: Icon, label, value, trend, loading }) {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-sm shadow-black/5">
            <div className="mb-3 flex items-center justify-between">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--soft)] text-[var(--heading)]">
                    <Icon size={17} />
                </div>
                <span className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[0.68rem] text-[var(--muted)]">{trend}</span>
            </div>
            <p className="text-xs text-[var(--muted)]">{label}</p>
            {loading ? <div className="mt-2 h-7 w-24 animate-pulse rounded bg-[var(--soft)]" /> : <p className="mt-1 text-xl font-semibold text-[var(--heading)]">{value}</p>}
        </div>
    )
}

export function BudgetCard({ item, currency, categoryBudget, onEdit, onDelete }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
            <div className="flex items-start justify-between gap-2.5">
                <div>
                    <p className="font-semibold text-[var(--heading)]">{categoryBudget ? item.category : item.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                        {categoryBudget ? `${money(item.limitAmount, currency)} límite` : `${toDateInput(item.startDate)} a ${toDateInput(item.endDate)}`}
                    </p>
                </div>
                <span className="rounded-full bg-[var(--panel)] px-2 py-0.5 text-[0.68rem] text-[var(--muted)]">{categoryBudget ? pct(item.alertThreshold) : item.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
                <button className="icon-button" onClick={onEdit} aria-label="Editar"><Pencil size={16} /></button>
                <button className="icon-button danger" onClick={onDelete} aria-label="Eliminar"><Trash2 size={16} /></button>
            </div>
        </div>
    )
}

export function CardGrid({ items, empty, children }) {
    if (!items?.length) return (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--soft)] p-5 text-center">
            <p className="font-semibold text-[var(--heading)]">{empty}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Agrega información para alimentar las gráficas y estadísticas.</p>
        </div>
    )
    return <div className="grid gap-3 md:grid-cols-2">{items.map(children)}</div>
}

export function StatusTile({ label, value }) {
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="mt-1 break-words font-semibold text-[var(--heading)]">{value}</p>
        </div>
    )
}
