import { Pencil, Trash2 } from 'lucide-react'
import EmptyState from './EmptyState.jsx'
import { money, pct, toDateInput } from '../../lib/dashboardHelpers.js'

export default function DataTable({ config, items, currency, onEdit, onDelete }) {
    if (!items?.length) {
        return <EmptyState />
    }

    return (
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--border)] text-left text-xs">
                    <thead className="bg-[var(--soft)] text-[0.68rem] uppercase tracking-[0.1em] text-[var(--muted)]">
                        <tr>
                            {config.columns.map((column) => (
                                <th className="px-3 py-2.5 font-semibold" key={column.key}>{column.label}</th>
                            ))}
                            {(onEdit || onDelete) && <th className="px-3 py-2.5 text-right font-semibold">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {items.map((item, index) => (
                            <tr key={getItemKey(item, config, index)} className="hover:bg-[var(--soft)]/70">
                                {config.columns.map((column) => (
                                    <td className="px-3 py-2.5" key={column.key}>
                                        <CellValue item={item} column={column} currency={currency} />
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-3 py-2.5">
                                        <div className="flex justify-end gap-2">
                                            {onEdit && (
                                                <button className="icon-button" onClick={() => onEdit(item)} aria-label="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button className="icon-button danger" onClick={() => onDelete(item)} aria-label="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function getItemKey(item, config, index) {
    return item._id || item.id || `${item.category}-${index}`
}

function CellValue({ item, column, currency }) {
    const value = item[column.key]
    if (column.money) return <span className="font-semibold text-[var(--heading)]">{value === null || value === undefined ? 'N/A' : money(value, currency)}</span>
    if (column.percent) return <span>{pct(value)}</span>
    if (column.date) return <span>{toDateInput(value)}</span>
    if (column.badge) return <span className="rounded-full bg-[var(--soft)] px-2 py-0.5 text-[0.68rem] font-medium capitalize">{value}</span>
    return <span>{value || 'N/A'}</span>
}
