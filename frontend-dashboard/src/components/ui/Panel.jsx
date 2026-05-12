export default function Panel({ title, icon: Icon, action, children, className = '' }) {
    return (
        <section className={`rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-sm shadow-black/5 sm:p-4 ${className}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-[var(--soft)] text-[var(--heading)]">
                    <Icon size={17} />
                </div>
                <h3 className="text-base font-semibold text-[var(--heading)]">{title}</h3>
                <div className="ml-auto">{action}</div>
            </div>
            {children}
        </section>
    )
}
