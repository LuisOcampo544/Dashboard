import { CalendarDays, LayoutDashboard, Menu, RefreshCw } from 'lucide-react'

export default function Topbar({ activePage, range, setRange, setSidebarOpen, refresh, isDemo, loading, navItems }) {
    const page = navItems.find((item) => item.id === activePage)
    const Icon = page?.icon || LayoutDashboard

    return (
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/90 px-3 py-2 backdrop-blur-xl sm:px-4 lg:px-6">
            <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-2.5">
                <button className="rounded-lg border border-[var(--border)] p-2 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
                    <Menu size={18} />
                </button>
                <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-[var(--soft)] text-[var(--heading)]">
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--muted)]">{isDemo ? 'Vista demo' : 'Conectado al backend'}</p>
                        <h2 className="text-lg font-semibold text-[var(--heading)]">{page?.label}</h2>
                    </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <DateControl label="Desde" value={range.from} onChange={(value) => setRange((current) => ({ ...current, from: value }))} />
                    <DateControl label="Hasta" value={range.to} onChange={(value) => setRange((current) => ({ ...current, to: value }))} />
                    <button className="icon-button" onClick={refresh} title="Actualizar" aria-label="Actualizar">
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                    </button>
                </div>
            </div>
        </header>
    )
}

function DateControl({ label, value, onChange }) {
    return (
        <label className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 text-xs text-[var(--muted)]">
            <CalendarDays size={15} />
            <span className="hidden sm:inline">{label}</span>
            <input className="w-28 bg-transparent text-xs text-[var(--heading)] outline-none" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
    )
}
