import { Layers3, Plus, WalletCards } from 'lucide-react'
import Panel from '../ui/Panel.jsx'
import { BudgetCard, CardGrid } from '../ui/Cards.jsx'

export default function BudgetsPage({ data, currency, onCreate, onEdit, onDelete }) {
    return (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Panel title="Periodos de presupuesto" icon={WalletCards} action={<button className="primary-button" onClick={() => onCreate('budget')}><Plus size={17} /> Periodo</button>}>
                <CardGrid items={data.budgets} empty="No hay presupuestos">
                    {(item) => (
                        <BudgetCard key={item._id || item.id} item={item} currency={currency} onEdit={() => onEdit('budget', item)} onDelete={() => onDelete('budget', item)} />
                    )}
                </CardGrid>
            </Panel>
            <Panel title="Límites por categoría" icon={Layers3} action={<button className="primary-button" onClick={() => onCreate('categoryBudget')}><Plus size={17} /> Límite</button>}>
                <CardGrid items={data.categoryBudgets} empty="No hay límites por categoría">
                    {(item) => (
                        <BudgetCard key={item._id || item.id} item={item} currency={currency} categoryBudget onEdit={() => onEdit('categoryBudget', item)} onDelete={() => onDelete('categoryBudget', item)} />
                    )}
                </CardGrid>
            </Panel>
        </div>
    )
}
