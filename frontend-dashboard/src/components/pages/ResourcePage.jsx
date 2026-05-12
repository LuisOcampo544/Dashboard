import { Plus } from 'lucide-react'
import Panel from '../ui/Panel.jsx'
import DataTable from '../ui/DataTable.jsx'
import { resourceConfig } from '../../lib/resourceConfig.js'

export default function ResourcePage({ resource, items, currency, onCreate, onEdit, onDelete }) {
    const config = resourceConfig[resource]
    const Icon = config.icon

    return (
        <Panel
            title={resource === 'income' ? 'Ingresos registrados' : 'Egresos registrados'}
            icon={Icon}
            action={<button className="primary-button" onClick={() => onCreate(resource)}><Plus size={17} /> Agregar</button>}
        >
            <DataTable config={config} items={items} currency={currency} onEdit={(item) => onEdit(resource, item)} onDelete={(item) => onDelete(resource, item)} />
        </Panel>
    )
}
