import { useMemo } from 'react'
import { AlertTriangle, BarChart3, Bell, ChartPie, CreditCard, PiggyBank, WalletCards, BadgeDollarSign, Layers3 } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Panel from '../ui/Panel.jsx'
import { ChartFrame, ChartTooltip } from '../ui/ChartComponents.jsx'
import { StatCard } from '../ui/Cards.jsx'
import AlertList from '../ui/AlertList.jsx'
import { buildTimeline, money, pct, palette } from '../../lib/dashboardHelpers.js'

export default function DashboardPage({ data, overview, alerts, loading, currency }) {
    const timeline = useMemo(() => buildTimeline(data.incomes, data.expenses), [data])
    const categoryRows = overview.categoryBreakdown || []
    const budgetUsage = categoryRows.filter((item) => item.budgetedAmount)
    const alertCount = alerts.alerts?.length || overview.overBudgetCategories?.length || 0

    return (
        <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <StatCard icon={BadgeDollarSign} label="Ingresos" value={money(overview.totalIncome, currency)} trend={pct(overview.savingsRate)} loading={loading} />
                <StatCard icon={CreditCard} label="Egresos" value={money(overview.totalExpense, currency)} trend={pct(overview.expenseToIncomeRatio)} loading={loading} />
                <StatCard icon={PiggyBank} label="Balance neto" value={money(overview.netBalance, currency)} trend="periodo" loading={loading} />
                <StatCard icon={WalletCards} label="Presupuesto restante" value={overview.remainingBudget === null ? 'Sin periodo' : money(overview.remainingBudget, currency)} trend={overview.periodCoverage?.budgetName || 'N/A'} loading={loading} />
                <StatCard icon={Bell} label="Alertas" value={alertCount} trend="riesgos" loading={loading} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
                <Panel title="Ingresos vs egresos" icon={BarChart3}>
                    <ChartFrame>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={timeline}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                <XAxis dataKey="label" stroke="var(--muted)" />
                                <YAxis stroke="var(--muted)" />
                                <Tooltip content={<ChartTooltip currency={currency} />} />
                                <Legend />
                                <Bar dataKey="income" name="Ingresos" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="expense" name="Egresos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                <Line type="monotone" dataKey="balance" name="Balance" stroke="#2563eb" strokeWidth={3} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartFrame>
                </Panel>

                <Panel title="Distribución por categoría" icon={ChartPie}>
                    <ChartFrame>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={categoryRows} dataKey="totalExpense" nameKey="category" innerRadius="58%" outerRadius="82%" paddingAngle={3}>
                                    {categoryRows.map((item, index) => <Cell key={item.category} fill={palette[index % palette.length]} />)}
                                </Pie>
                                <Tooltip content={<ChartTooltip currency={currency} />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartFrame>
                </Panel>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Panel title="Presupuesto usado" icon={Layers3} className="xl:col-span-2">
                    <ChartFrame compact>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetUsage} layout="vertical" margin={{ left: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                                <XAxis type="number" stroke="var(--muted)" />
                                <YAxis dataKey="category" type="category" width={100} stroke="var(--muted)" />
                                <Tooltip content={<ChartTooltip currency={currency} />} />
                                <Bar dataKey="totalExpense" name="Usado" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                                <Bar dataKey="budgetedAmount" name="Límite" fill="#94a3b8" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartFrame>
                </Panel>

                <Panel title="Alertas activas" icon={AlertTriangle}>
                    <AlertList overview={overview} alerts={alerts} currency={currency} />
                </Panel>
            </div>
        </div>
    )
}
