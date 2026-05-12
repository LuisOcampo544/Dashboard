export default function Input({ label, value, onChange, type = 'text', step, required }) {
    return (
        <label className="field-label">
            {label}
            <input
                className="field-input"
                type={type}
                step={step}
                value={value}
                required={required}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    )
}
