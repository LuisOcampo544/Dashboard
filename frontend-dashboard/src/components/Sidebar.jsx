import { CircleDollarSign, ChevronRight, LogOut, UserRound, X } from 'lucide-react'

export default function Sidebar({ activePage, setActivePage, open, setOpen, user, navItems, isDemo, logout }) {
    return (
        <>
            <div className={`fixed inset-0 z-30 bg-black/30 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={() => setOpen(false)} />
            <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--panel)] p-3 shadow-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-4 flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-[var(--accent)] text-white shadow-md shadow-black/10">
                        <CircleDollarSign size={21} />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--muted)]">Finanzas</p>
                        <h1 className="text-lg font-semibold text-[var(--heading)]">Dashboard</h1>
                    </div>
                    <button className="ml-auto rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--soft)] lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
                        <X size={18} />
                    </button>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const active = activePage === item.id
                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`nav-item ${active ? 'nav-item-active' : ''}`}
                                onClick={() => {
                                    setActivePage(item.id)
                                    setOpen(false)
                                }}
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                                {active && <ChevronRight className="ml-auto" size={16} />}
                            </button>
                        )
                    })}
                </nav>

                <div className="mt-auto rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
                    <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-full bg-[var(--panel)] text-[var(--heading)]">
                            <UserRound size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--heading)]">{user.name}</p>
                            <p className="truncate text-xs text-[var(--muted)]">{isDemo ? 'Modo demo' : user.email}</p>
                        </div>
                    </div>
                    {!isDemo && (
                        <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--panel)]" onClick={logout}>
                            <LogOut size={16} /> Salir
                        </button>
                    )}
                </div>
            </aside>
        </>
    )
}
