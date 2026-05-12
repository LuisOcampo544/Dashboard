import { Save, X } from 'lucide-react'
import { useState } from 'react'
import { resourceConfig } from '../lib/resourceConfig.js'
import { getId, toDateInput } from '../lib/dashboardHelpers.js'
import FieldControl from './ui/FieldControl.jsx'

export default function EditModal({ modal, data, currency, onClose, onSubmit }) {
    const config = resourceConfig[modal.resource]
    const [form, setForm] = useState(() => {
        const item = modal.item || {}
        return Object.fromEntries(config.fields.map((field) => {
            const fallback = field.type === 'date' ? toDateInput(new Date()) : field.type === 'select' ? field.options[0] : ''
            const value = item[field.name] ?? fallback
            return [field.name, field.type === 'date' ? toDateInput(value) : value]
        }))
    })

    const submit = (event) => {
        event.preventDefault()
        const payload = { ...form }
        config.fields.forEach((field) => {
            if (field.type === 'number') {
                payload[field.name] = Number(payload[field.name])
            }
        })
        onSubmit(modal.resource, modal.item ? 'update' : 'create', payload, getId(modal.item))
    }

    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
            <form className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-2xl" onSubmit={submit}>
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{modal.item ? 'Editar' : 'Crear'}</p>
                        <h3 className="text-lg font-semibold text-[var(--heading)]">{config.title}</h3>
                    </div>
                    <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
                </div>
                <div className="grid gap-3">
                    {config.fields.map((field) => (
                        <FieldControl
                            key={field.name}
                            field={field}
                            value={form[field.name]}
                            data={data}
                            currency={currency}
                            onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
                        />
                    ))}
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" className="ghost-button" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="primary-button"><Save size={17} /> Guardar</button>
                </div>
            </form>
        </div>
    )
}
