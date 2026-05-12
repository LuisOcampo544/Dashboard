export default function EmptyState({ title = 'Sin registros' }) {
    return (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--soft)] p-5 text-center">
            <p className="font-semibold text-[var(--heading)]">{title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Agrega información para alimentar las gráficas y estadísticas.</p>
        </div>
    )
}
