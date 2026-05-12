import Input from './Input.jsx'
import { toDateInput } from '../../lib/dashboardHelpers.js'

export default function FieldControl({ field, value, data, onChange }) {
    if (field.type === 'textarea') {
        return (
            <label className="field-label">
                {field.label}
                <textarea
                    className="field-input min-h-20 resize-y"
                    value={value || ''}
                    onChange={(event) => onChange(event.target.value)}
                />
            </label>
        )
    }

    if (field.type === 'select') {
        return (
            <label className="field-label">
                {field.label}
                <select
                    className="field-input"
                    value={value || field.options[0]}
                    onChange={(event) => onChange(event.target.value)}
                >
                    {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </label>
        )
    }

    if (field.type === 'category') {
        return (
            <label className="field-label">
                {field.label}
                <select
                    className="field-input"
                    value={value || ''}
                    onChange={(event) => onChange(event.target.value)}
                    required={field.required}
                >
                    <option value="">Selecciona categoría</option>
                    {data.categories.map((category) => (
                        <option key={`${category.name}-${category.id}`} value={category.name}>{category.name}</option>
                    ))}
                </select>
            </label>
        )
    }

    if (field.type === 'budget') {
        return (
            <label className="field-label">
                {field.label}
                <select
                    className="field-input"
                    value={value || ''}
                    onChange={(event) => onChange(event.target.value)}
                    required={field.required}
                >
                    <option value="">Selecciona presupuesto</option>
                    {data.budgets.map((budget) => (
                        <option key={budget._id || budget.id} value={budget._id || budget.id}>{budget.name}</option>
                    ))}
                </select>
            </label>
        )
    }

    return (
        <Input
            label={field.label}
            type={field.type}
            step={field.step}
            value={value ?? ''}
            required={field.required}
            onChange={onChange}
        />
    )
}
