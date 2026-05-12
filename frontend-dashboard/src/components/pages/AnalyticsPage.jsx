import { useMemo } from 'react'
import { AlertTriangle, BadgeDollarSign, ChartPie, ShieldCheck } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Legend, Line, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Panel from '../ui/Panel.jsx'
import { ChartFrame, ChartTooltip } from '../ui/ChartComponents.jsx'
import DataTable from '../ui/DataTable.jsx'
import AlertList from '../ui/AlertList.jsx'
import { buildTimeline } from '../../lib/dashboardHelpers.js'

export default function AnalyticsPage({ data, overview, alerts, currency }) {
    const timeline = useMemo(() => buildTimeline(data.incomes, data.expenses), [data])

    return (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Tendencia de ingresos" icon={BadgeDollarSign}>
                <ChartFrame>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline}>
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                            <XAxis dataKey="label" stroke="var(--muted)" />
                            <YAxis stroke="var(--muted)" />
                            <Tooltip content={<ChartTooltip currency={currency} />} />
                            <Area dataKey="income" name="Ingresos" stroke="#14b8a6" fill="url(#incomeGradient)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartFrame>
            </Panel>
            <Panel title="Salud del periodo" icon={ShieldCheck}>
                <ChartFrame>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="30%" outerRadius="90%" data={[
                            { name: 'Ahorro', value: Math.max(0, Number(overview.savingsRate || 0) * 100), fill: '#14b8a6' },
                            { name: 'Gasto', value: Math.min(100, Number(overview.expenseToIncomeRatio || 0) * 100), fill: '#ef4444' },
                            { name: 'Presupuesto', value: overview.periodCoverage?.totalBudget ? Math.min(100, Number(overview.totalExpense / overview.periodCoverage.totalBudget) * 100) : 0, fill: '#8b5cf6' },
                        ]}>
                            <RadialBar dataKey="value" background cornerRadius={8} />
                            <Tooltip />
                            <Legend />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </ChartFrame>
            </Panel>
            <Panel title="Detalle por categoría" icon={ChartPie} className="xl:col-span-2">
                <DataTable
                    config={{
                        columns: [
                            { key: 'category', label: 'Categoría' },
                            { key: 'totalExpense', label: 'Gasto', money: true },
                            { key: 'budgetedAmount', label: 'Presupuesto', money: true },
                            { key: 'remainingBudget', label: 'Restante', money: true },
                            { key: 'usageRatio', label: 'Uso', percent: true },
                        ],
                    }}
                    items={overview.categoryBreakdown || []}
                    currency={currency}
                />
            </Panel>
            <Panel title="Alertas" icon={AlertTriangle} className="xl:col-span-2">
                <AlertList overview={overview} alerts={alerts} currency={currency} />
            </Panel>
        </div>
    )
}
