import { LogIn, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Input from './ui/Input.jsx'

export default function AuthStrip({ onSubmit }) {
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'USD' })

    return (
        <section className="border-b border-[var(--border)] bg-[var(--panel)] px-3 py-3 sm:px-4 lg:px-6">
            <div className="mx-auto flex max-w-[1360px] flex-col gap-2.5 xl:flex-row xl:items-end">
                <div className="mr-auto">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[var(--heading)]"><Sparkles size={16} /> Demo activo</p>
                    <p className="text-xs text-[var(--muted)]">Inicia sesión o crea una cuenta para guardar y editar datos reales del backend.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {mode === 'register' && <Input label="Nombre" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />}
                    <Input label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
                    <Input label="Contraseña" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
                    {mode === 'register' && <Input label="Moneda" value={form.currency} onChange={(value) => setForm({ ...form, currency: value.toUpperCase() })} />}
                    <button className="primary-button" onClick={() => onSubmit(mode, form)}><LogIn size={17} /> {mode === 'login' ? 'Entrar' : 'Crear'}</button>
                    <button className="ghost-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Registrarme' : 'Ya tengo cuenta'}</button>
                </div>
            </div>
        </section>
    )
}
