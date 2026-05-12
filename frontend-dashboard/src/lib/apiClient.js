const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const readErrorMessage = async (response) => {
  try {
    const payload = await response.json()
    return payload?.error?.message || payload?.message || 'No se pudo completar la solicitud'
  } catch {
    return 'No se pudo completar la solicitud'
  }
}

export const createApiClient = ({ token, onUnauthorized } = {}) => {
  const request = async (path, options = {}) => {
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (response.status === 401 && onUnauthorized) {
      onUnauthorized()
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response))
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  return {
    register: (body) => request('/api/user/register', { method: 'POST', body }),
    login: (body) => request('/api/user/login', { method: 'POST', body }),
    getUser: (id) => request(`/api/user/${id}`),
    updateUser: (id, body) => request(`/api/user/${id}`, { method: 'PUT', body }),
    updatePassword: (id, body) => request(`/api/user/${id}/password`, { method: 'PATCH', body }),
    deleteUser: (id) => request(`/api/user/${id}`, { method: 'DELETE' }),
    listIncomes: (query) => request(`/api/incomes${query}`),
    createIncome: (body) => request('/api/incomes', { method: 'POST', body }),
    updateIncome: (id, body) => request(`/api/incomes/${id}`, { method: 'PUT', body }),
    deleteIncome: (id) => request(`/api/incomes/${id}`, { method: 'DELETE' }),
    listExpenses: (query) => request(`/api/expense${query}`),
    createExpense: (body) => request('/api/expense', { method: 'POST', body }),
    updateExpense: (id, body) => request(`/api/expense/${id}`, { method: 'PUT', body }),
    deleteExpense: (id) => request(`/api/expense/${id}`, { method: 'DELETE' }),
    listBudgets: (query = '') => request(`/api/budget-periods${query}`),
    createBudget: (body) => request('/api/budget-periods', { method: 'POST', body }),
    updateBudget: (id, body) => request(`/api/budget-periods/${id}`, { method: 'PUT', body }),
    deleteBudget: (id) => request(`/api/budget-periods/${id}`, { method: 'DELETE' }),
    listCategoryBudgets: (query = '') => request(`/api/category-budgets${query}`),
    createCategoryBudget: (body) => request('/api/category-budgets', { method: 'POST', body }),
    updateCategoryBudget: (id, body) => request(`/api/category-budgets/${id}`, { method: 'PUT', body }),
    deleteCategoryBudget: (id) => request(`/api/category-budgets/${id}`, { method: 'DELETE' }),
    listCategories: () => request('/api/categories'),
    createCategory: (body) => request('/api/categories', { method: 'POST', body }),
    deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),
    overview: (query) => request(`/api/analytics/overview${query}`),
    categoryAnalytics: (query) => request(`/api/analytics/categories${query}`),
    alerts: (query) => request(`/api/analytics/alerts${query}`),
  }
}
