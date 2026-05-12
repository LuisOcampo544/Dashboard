import { CheckCircle2, Palette, Settings } from 'lucide-react'
import Panel from '../ui/Panel.jsx'
import { StatusTile } from '../ui/Cards.jsx'
import { themes } from '../../lib/dashboardHelpers.js'

export default function SettingsPage({ theme, setTheme, isDemo, apiOnline }) {
    return (
        <div className="space-y-5">
            <Panel title="Temas visuales" icon={Palette}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {themes.map((item) => (
                        <button
                            key={item.id}
                            className={`theme-card ${theme === item.id ? 'theme-card-active' : ''}`}
                            onClick={() => setTheme(item.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid size-8 place-items-center rounded-lg bg-[var(--soft)]"><item.icon size={16} /></div>
                                <div className="text-left">
                                    <p className="font-semibold text-[var(--heading)]">{item.name}</p>
                                    <p className="text-xs text-[var(--muted)]">{item.mode}</p>
                                </div>
                            </div>
                            {theme === item.id && <CheckCircle2 className="text-[var(--accent)]" size={18} />}
                        </button>
                    ))}
                </div>
            </Panel>
            <Panel title="Estado de integración" icon={Settings}>
                <div className="grid gap-3 md:grid-cols-3">
                    <StatusTile label="Backend" value={apiOnline ? 'Disponible' : 'Fallback demo'} />
                    <StatusTile label="Datos" value={isDemo ? 'Demo editable local' : 'API real'} />
                    <StatusTile label="Base URL" value={import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'} />
                </div>
            </Panel>
        </div>
    )
}
