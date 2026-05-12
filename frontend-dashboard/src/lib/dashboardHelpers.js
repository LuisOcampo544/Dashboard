import { Moon, Sun } from 'lucide-react'

export const palette = ['#14b8a6', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#f97316', '#06b6d4']

export const themes = [
    { id: 'aurora', name: 'Aurora', mode: 'Claro', icon: Sun },
    { id: 'mint', name: 'Menta', mode: 'Claro', icon: Sun },
    { id: 'paper', name: 'Papel', mode: 'Claro', icon: Sun },
    { id: 'midnight', name: 'Medianoche', mode: 'Oscuro', icon: Moon },
    { id: 'graphite', name: 'Grafito', mode: 'Oscuro', icon: Moon },
    { id: 'ember', name: 'Ember', mode: 'Oscuro', icon: Moon },
]

export function defaultRange() {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from: toDateInput(from), to: toDateInput(to) }
}

export function toDateInput(value) {
    if (!value) return ''
    return new Date(value).toISOString().slice(0, 10)
}

export function money(value, currency = 'USD') {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(Number(value || 0))
}

export function pct(value) {
    if (value === null || value === undefined) return 'N/A'
    return `${Math.round(Number(value) * 100)}%`
}

export function getId(item) {
    return item?._id || item?.id
}

export function queryString(params) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, value)
        }
    })
    const query = search.toString()
    return query ? `?${query}` : ''
}

export function nextDemoId(prefix) {
    return `${prefix}-${Date.now()}`
}

export function buildTimeline(incomes, expenses) {
    const bucket = new Map()
    const add = (dateValue, key, amount) => {
        const date = new Date(dateValue)
        const label = `${date.getDate()}/${date.getMonth() + 1}`
        const current = bucket.get(label) || { label, income: 0, expense: 0, order: date.getTime() }
        current[key] += Number(amount || 0)
        current.balance = current.income - current.expense
        bucket.set(label, current)
    }

    incomes.forEach((item) => {
        if (item.status !== 'cancelled') add(item.date, 'income', item.amount)
    })
    expenses.forEach((item) => add(item.date, 'expense', item.amount))

    return [...bucket.values()]
        .sort((a, b) => a.order - b.order)
        .map((item) => ({ ...item, balance: item.income - item.expense }))
}

export function formatAlertType(type) {
    const labels = {
        CATEGORY_BUDGET_EXCEEDED: 'Presupuesto excedido',
        CATEGORY_BUDGET_THRESHOLD_REACHED: 'Umbral de categoría alcanzado',
        EXPENSE_TO_INCOME_THRESHOLD_REACHED: 'Egreso alto frente al ingreso',
    }
    return labels[type] || type
}
