const today = new Date()
const iso = (monthOffset, day) => {
  const date = new Date(today.getFullYear(), today.getMonth() + monthOffset, day)
  return date.toISOString()
}

export const demoUser = {
  id: 'demo-user',
  name: 'Ana Finanzas',
  email: 'ana@mail.com',
  currency: 'USD',
}

export const demoData = {
  incomes: [
    { _id: 'inc-1', amount: 4200, source: 'Salary', status: 'confirmed', date: iso(0, 2), note: 'Pago mensual' },
    { _id: 'inc-2', amount: 850, source: 'Freelance', status: 'confirmed', date: iso(0, 10), note: 'Proyecto dashboard' },
    { _id: 'inc-3', amount: 260, source: 'Investments', status: 'pending', date: iso(0, 18), note: 'Dividendos' },
    { _id: 'inc-4', amount: 3900, source: 'Salary', status: 'confirmed', date: iso(-1, 2), note: 'Pago mensual' },
  ],
  expenses: [
    { _id: 'exp-1', amount: 820, category: 'Housing', date: iso(0, 3), note: 'Renta' },
    { _id: 'exp-2', amount: 410, category: 'Food', date: iso(0, 5), note: 'Supermercado' },
    { _id: 'exp-3', amount: 160, category: 'Transport', date: iso(0, 8), note: 'Gasolina' },
    { _id: 'exp-4', amount: 230, category: 'Utilities', date: iso(0, 12), note: 'Servicios' },
    { _id: 'exp-5', amount: 320, category: 'Entertainment', date: iso(0, 16), note: 'Cena y streaming' },
    { _id: 'exp-6', amount: 700, category: 'Savings', date: iso(0, 20), note: 'Fondo de emergencia' },
    { _id: 'exp-7', amount: 390, category: 'Food', date: iso(-1, 15), note: 'Restaurantes' },
  ],
  budgets: [
    {
      _id: 'bud-1',
      name: 'Mayo controlado',
      startDate: iso(0, 1),
      endDate: iso(0, 30),
      status: 'active',
      currency: 'USD',
      expenseToIncomeAlertThreshold: 0.85,
    },
  ],
  categoryBudgets: [
    { _id: 'cb-1', budgetId: 'bud-1', category: 'Housing', limitAmount: 900, alertThreshold: 0.85 },
    { _id: 'cb-2', budgetId: 'bud-1', category: 'Food', limitAmount: 700, alertThreshold: 0.8 },
    { _id: 'cb-3', budgetId: 'bud-1', category: 'Transport', limitAmount: 250, alertThreshold: 0.75 },
    { _id: 'cb-4', budgetId: 'bud-1', category: 'Entertainment', limitAmount: 300, alertThreshold: 0.8 },
    { _id: 'cb-5', budgetId: 'bud-1', category: 'Savings', limitAmount: 900, alertThreshold: 0.9 },
  ],
  categories: [
    'Food',
    'Transport',
    'Housing',
    'Utilities',
    'Healthcare',
    'Education',
    'Entertainment',
    'Savings',
    'Debt',
    'Other',
  ].map((name) => ({ id: null, name, isDefault: true })),
}

export const buildDemoOverview = ({ incomes, expenses, budgets, categoryBudgets }, range, user = demoUser) => {
  const from = new Date(range.from)
  const to = new Date(range.to)
  const inRange = (item) => {
    const date = new Date(item.date || item.startDate)
    return date >= from && date <= to
  }

  const activeIncomes = incomes.filter((item) => item.status === 'confirmed' && inRange(item))
  const activeExpenses = expenses.filter(inRange)
  const totalIncome = activeIncomes.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpense = activeExpenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const selectedBudget = budgets.find((budget) => budget.status === 'active') || budgets[0]
  const selectedCategoryBudgets = selectedBudget
    ? categoryBudgets.filter((item) => String(item.budgetId) === String(selectedBudget._id))
    : []
  const totalBudget = selectedCategoryBudgets.reduce((sum, item) => sum + Number(item.limitAmount), 0)
  const categories = new Set([
    ...activeExpenses.map((item) => item.category),
    ...selectedCategoryBudgets.map((item) => item.category),
  ])

  const categoryBreakdown = [...categories].map((category) => {
    const total = activeExpenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const budget = selectedCategoryBudgets.find((item) => item.category === category)
    const budgetedAmount = budget ? Number(budget.limitAmount) : null
    const usageRatio = budgetedAmount ? total / budgetedAmount : null

    return {
      category,
      totalExpense: total,
      percentageOfExpense: totalExpense > 0 ? total / totalExpense : 0,
      percentageOfIncome: totalIncome > 0 ? total / totalIncome : null,
      budgetedAmount,
      remainingBudget: budgetedAmount === null ? null : budgetedAmount - total,
      usageRatio,
      alertThreshold: budget?.alertThreshold ?? null,
      isOverBudget: budgetedAmount !== null && total > budgetedAmount,
    }
  }).sort((a, b) => b.totalExpense - a.totalExpense)

  return {
    from: range.from,
    to: range.to,
    currency: user.currency || 'USD',
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    expenseToIncomeRatio: totalIncome > 0 ? totalExpense / totalIncome : null,
    savingsRate: totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : null,
    remainingBudget: selectedBudget ? totalBudget - totalExpense : null,
    categoryBreakdown,
    overBudgetCategories: categoryBreakdown.filter((item) => item.isOverBudget).map((item) => item.category),
    periodCoverage: {
      hasBudget: Boolean(selectedBudget),
      budgetId: selectedBudget?._id || null,
      budgetName: selectedBudget?.name || null,
      currency: selectedBudget?.currency || user.currency,
      totalBudget: selectedBudget ? totalBudget : null,
      matchedBudgets: selectedBudget ? [selectedBudget] : [],
    },
  }
}
