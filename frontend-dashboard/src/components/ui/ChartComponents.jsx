export function ChartFrame({ children, compact }) {
    return <div className={compact ? 'h-56 min-w-0 sm:h-60' : 'h-60 min-w-0 sm:h-[17rem]'}>{children}</div>
}

export function ChartTooltip({ active, payload, label, currency }) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2.5 shadow-xl">
            <p className="mb-1.5 text-xs font-semibold text-[var(--heading)]">{label}</p>
            {payload.map((item) => (
                <p key={item.dataKey} className="text-xs" style={{ color: item.color }}>
                    {item.name}: {item.value === null || item.value === undefined ? 'N/A' : new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(item.value || 0))}
                </p>
            ))}
        </div>
    )
}
