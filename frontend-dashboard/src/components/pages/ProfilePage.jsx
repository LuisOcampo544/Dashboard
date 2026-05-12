import { useState } from 'react'
import { Save, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import Panel from '../ui/Panel.jsx'
import Input from '../ui/Input.jsx'
import toast from 'react-hot-toast'

export default function ProfilePage({ user, auth, api, isDemo, setAuth, logout }) {
    const [profile, setProfile] = useState({ name: user.name, email: user.email, currency: user.currency || 'USD' })
    const [password, setPassword] = useState({ currentPassword: '', newPassword: '' })

    const saveProfile = async () => {
        if (isDemo) {
            toast('Inicia sesión para editar el perfil real')
            return
        }
        try {
            const updated = await api.updateUser(auth.user.id, profile)
            const nextUser = { id: updated._id || updated.id, name: updated.name, email: updated.email, currency: updated.currency }
            localStorage.setItem('finance-dashboard-user', JSON.stringify(nextUser))
            setAuth((current) => ({ ...current, user: nextUser }))
            toast.success('Perfil actualizado')
        } catch (error) {
            toast.error(error.message)
        }
    }

    const savePassword = async () => {
        if (isDemo) {
            toast('Inicia sesión para cambiar contraseña')
            return
        }
        try {
            await api.updatePassword(auth.user.id, password)
            setPassword({ currentPassword: '', newPassword: '' })
            toast.success('Contraseña actualizada')
        } catch (error) {
            toast.error(error.message)
        }
    }

    const deleteAccount = async () => {
        if (isDemo || !window.confirm('¿Eliminar tu cuenta y todos sus datos?')) return
        try {
            await api.deleteUser(auth.user.id)
            logout()
            toast.success('Cuenta eliminada')
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Editar usuario" icon={UserRound}>
                <div className="grid gap-3">
                    <Input label="Nombre" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
                    <Input label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
                    <Input label="Moneda" value={profile.currency} onChange={(value) => setProfile({ ...profile, currency: value.toUpperCase() })} />
                    <button className="primary-button w-fit" onClick={saveProfile}><Save size={17} /> Guardar perfil</button>
                </div>
            </Panel>
            <Panel title="Seguridad" icon={ShieldCheck}>
                <div className="grid gap-3">
                    <Input label="Contraseña actual" type="password" value={password.currentPassword} onChange={(value) => setPassword({ ...password, currentPassword: value })} />
                    <Input label="Nueva contraseña" type="password" value={password.newPassword} onChange={(value) => setPassword({ ...password, newPassword: value })} />
                    <div className="flex flex-wrap gap-2">
                        <button className="primary-button" onClick={savePassword}><Save size={17} /> Cambiar contraseña</button>
                        <button className="danger-button" onClick={deleteAccount}><Trash2 size={17} /> Eliminar cuenta</button>
                    </div>
                </div>
            </Panel>
        </div>
    )
}
