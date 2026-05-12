import { Plus, Tag, Trash2 } from 'lucide-react'
import Panel from '../ui/Panel.jsx'

export default function CategoriesPage({ data, onCreate, onDelete }) {
    return (
        <Panel title="Catálogo de categorías" icon={Tag} action={<button className="primary-button" onClick={() => onCreate('category')}><Plus size={17} /> Categoría</button>}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {data.categories.map((category) => (
                    <div key={`${category.name}-${category.id}`} className="rounded-lg border border-[var(--border)] bg-[var(--soft)] p-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold text-[var(--heading)]">{category.name}</p>
                                <p className="text-xs text-[var(--muted)]">{category.isDefault ? 'Predeterminada' : 'Personalizada'}</p>
                            </div>
                            {!category.isDefault && (
                                <button className="icon-button danger" onClick={() => onDelete('category', category)} aria-label="Eliminar categoría">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    )
}
