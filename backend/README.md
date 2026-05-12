# Backend Financiero

API REST para registrar usuarios, gastos, ingresos y presupuestos flexibles, y para analizar consumo financiero en rangos de fecha con control estricto de acceso por usuario.

## Propósito

Este backend permite:

- Registrar y autenticar usuarios.
- Registrar gastos e ingresos por usuario.
- Configurar periodos de presupuesto flexibles.
- Asignar presupuestos por categoría.
- Consultar analítica financiera por rango.
- Recibir errores homogéneos, trazables y seguros.

## Stack y arquitectura

- `Node.js`
- `Express 5`
- `MongoDB + Mongoose`
- `JWT`
- `Jest + Supertest`

Arquitectura actual:

- `routes -> controllers -> services -> repositories -> models`

Capas de hardening implementadas:

- `helmet`
- `cors` con allowlist
- `express-rate-limit`
- request id por request con header `X-Request-Id`
- contrato global de error
- 404 y 405 uniformes

## Variables de entorno

Variables usadas por la aplicación:

| Variable | Requerida | Descripción | Ejemplo |
|---|---|---|---|
| `PORT` | Sí | Puerto HTTP | `3000` |
| `MONGODB_URI` | Sí | URI de MongoDB | `mongodb://127.0.0.1:27017/finance` |
| `JWT_SECRET` | Sí | Secreto para firmar tokens | `super-secret-key` |
| `JWT_EXPIRES_IN` | No | Tiempo de expiración JWT | `1y` en desarrollo, recomendado `12h` en producción |
| `NODE_ENV` | No | Entorno | `development`, `test`, `production` |
| `CORS_ORIGINS` | Requerida en producción | Lista separada por comas | `https://app.midominio.com,https://admin.midominio.com` |
| `API_RATE_LIMIT_WINDOW_MS` | No | Ventana del rate limit global | `900000` |
| `API_RATE_LIMIT_MAX` | No | Máximo de requests globales por ventana | `200` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | No | Ventana del rate limit de auth | `900000` |
| `AUTH_RATE_LIMIT_MAX` | No | Máximo de intentos de auth por ventana | `5` |

## Arranque local

Instalar dependencias:

```powershell
npm install
```

Levantar en desarrollo:

```powershell
npm run dev
```

Ejecutar pruebas:

```powershell
npm test -- --runInBand
```

## Autenticación

La API usa `Authorization: Bearer <token>`.

Flujo recomendado:

1. Registrar usuario con `POST /api/user/register`
2. Guardar `token`
3. Usar el token en todos los endpoints protegidos

Variables reutilizables en PowerShell:

```powershell
$env:BASE_URL="http://localhost:3000"
$env:TOKEN=""
$env:USER_ID=""
$env:EXPENSE_ID=""
$env:INCOME_ID=""
$env:BUDGET_ID=""
$env:CATEGORY_BUDGET_ID=""
$env:CATEGORY_ID=""
```

Ejemplo para guardar token tras login:

```powershell
$login = curl.exe -s -X POST "$env:BASE_URL/api/user/login" `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"ana@mail.com\",\"password\":\"Password123\"}" | ConvertFrom-Json

$env:TOKEN = $login.token
$env:USER_ID = $login.user.id
```

## Contrato global de errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Amount must be a positive number",
    "status": 400,
    "details": null,
    "requestId": "7d3c4d46-1dfc-4c73-93b3-264768af0d56"
  }
}
```

Notas:

- Todas las respuestas incluyen header `X-Request-Id`.
- En desarrollo y test puede incluirse `error.stack`.
- En producción no se expone stack ni mensajes internos para errores 500.

Códigos más comunes:

- `BAD_REQUEST`
- `VALIDATION_ERROR`
- `INVALID_IDENTIFIER`
- `MALFORMED_JSON`
- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `TOKEN_EXPIRED`
- `FORBIDDEN`
- `NOT_FOUND`
- `ROUTE_NOT_FOUND`
- `METHOD_NOT_ALLOWED`
- `CONFLICT`
- `DUPLICATE_VALUE`
- `AUTH_RATE_LIMIT_EXCEEDED`
- `API_RATE_LIMIT_EXCEEDED`
- `INTERNAL_SERVER_ERROR`

## Resumen de seguridad

Hardening actual:

- `helmet` activo.
- `x-powered-by` deshabilitado.
- CORS validado por allowlist.
- Límite de tamaño JSON: `16kb`.
- Rate limit global y específico para login/register.
- Validación de variables de entorno al iniciar.
- JWT configurable por `JWT_EXPIRES_IN`.
- 404 y 405 homogéneos.
- Request ID por request.
- Manejo de `JsonWebTokenError`, `TokenExpiredError`, JSON inválido, `CastError`, `ValidationError` y duplicados de Mongo.

Auditoría local de dependencias:

- `npm audit --json` ejecutado el **10 de mayo de 2026**
- Resultado: **0 vulnerabilidades**

Checklist de superficie de ataque revisada:

- fuga de información en errores
- autenticación y expiración de token
- control de acceso por usuario
- brute force en auth
- CORS permisivo
- headers inseguros por defecto
- payload oversized
- manejo de JSON inválido
- variables de entorno faltantes

## Catálogo completo de endpoints

### POST `/api/user/register`

Propósito: crear un usuario y devolver token.

Auth: no.

Body:

```json
{
  "name": "Ana",
  "email": "ana@mail.com",
  "password": "Password123",
  "currency": "USD"
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/user/register" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Ana\",\"email\":\"ana@mail.com\",\"password\":\"Password123\",\"currency\":\"USD\"}"
```

Respuesta exitosa:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "68200d4d6c264c5f60f68401",
    "name": "Ana",
    "email": "ana@mail.com",
    "currency": "USD"
  }
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "User already exists",
    "status": 409,
    "details": null,
    "requestId": "request-id"
  }
}
```

### POST `/api/user/login`

Propósito: autenticar y devolver token.

Auth: no.

Body:

```json
{
  "email": "ana@mail.com",
  "password": "Password123"
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/user/login" `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"ana@mail.com\",\"password\":\"Password123\"}"
```

Respuesta exitosa:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "68200d4d6c264c5f60f68401",
    "name": "Ana",
    "email": "ana@mail.com",
    "currency": "USD"
  }
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_RATE_LIMIT_EXCEEDED",
    "message": "Too many authentication attempts",
    "status": 429,
    "details": {
      "retryAfterSeconds": 900
    },
    "requestId": "request-id"
  }
}
```

### GET `/api/user/:id`

Propósito: obtener el perfil del usuario autenticado.

Auth: sí.

Path params:

- `id`: id del usuario autenticado

```powershell
curl.exe "$env:BASE_URL/api/user/$env:USER_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68401",
  "name": "Ana",
  "email": "ana@mail.com",
  "currency": "USD",
  "createdAt": "2026-05-10T00:00:00.000Z"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only access your own user resource",
    "status": 403,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PUT `/api/user/:id`

Propósito: actualizar nombre, email o moneda del usuario autenticado.

Auth: sí.

Body permitido:

```json
{
  "name": "Ana Gómez",
  "email": "ana.gomez@mail.com",
  "currency": "MXN"
}
```

```powershell
curl.exe -X PUT "$env:BASE_URL/api/user/$env:USER_ID" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Ana Gómez\",\"currency\":\"MXN\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68401",
  "name": "Ana Gómez",
  "email": "ana@mail.com",
  "currency": "MXN",
  "createdAt": "2026-05-10T00:00:00.000Z"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "At least one user field is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PATCH `/api/user/:id/password`

Propósito: actualizar contraseña.

Auth: sí.

Body:

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

```powershell
curl.exe -X PATCH "$env:BASE_URL/api/user/$env:USER_ID/password" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"currentPassword\":\"Password123\",\"newPassword\":\"NewPassword123\"}"
```

Respuesta exitosa:

```json
{
  "message": "Password updated successfully"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Current password is invalid",
    "status": 401,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/user/:id`

Propósito: eliminar usuario y sus datos relacionados.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/user/$env:USER_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### POST `/api/expense`

Propósito: registrar gasto.

Auth: sí.

Body:

```json
{
  "amount": 320.5,
  "category": "Food",
  "date": "2026-05-10",
  "note": "Supermercado"
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/expense" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"amount\":320.5,\"category\":\"Food\",\"date\":\"2026-05-10\",\"note\":\"Supermercado\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68410",
  "userId": "68200d4d6c264c5f60f68401",
  "amount": 320.5,
  "category": "Food",
  "date": "2026-05-10T00:00:00.000Z",
  "note": "Supermercado"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Amount must be a positive number",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/expense`

Propósito: listar gastos del usuario.

Auth: sí.

Query params opcionales:

- `from`
- `to`
- `category`

```powershell
curl.exe "$env:BASE_URL/api/expense?from=2026-05-01&to=2026-05-31" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
[
  {
    "_id": "68200d4d6c264c5f60f68410",
    "amount": 320.5,
    "category": "Food",
    "date": "2026-05-10T00:00:00.000Z",
    "note": "Supermercado"
  }
]
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token",
    "status": 401,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/expense/:id`

Propósito: obtener un gasto específico del usuario.

Auth: sí.

```powershell
curl.exe "$env:BASE_URL/api/expense/$env:EXPENSE_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68410",
  "amount": 320.5,
  "category": "Food",
  "date": "2026-05-10T00:00:00.000Z",
  "note": "Supermercado"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Expense not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PUT `/api/expense/:id`

Propósito: actualizar gasto.

Auth: sí.

Body permitido:

```json
{
  "amount": 350,
  "category": "Food",
  "date": "2026-05-11",
  "note": "Supermercado y farmacia"
}
```

```powershell
curl.exe -X PUT "$env:BASE_URL/api/expense/$env:EXPENSE_ID" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"amount\":350,\"note\":\"Supermercado y farmacia\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68410",
  "amount": 350,
  "category": "Food",
  "date": "2026-05-10T00:00:00.000Z",
  "note": "Supermercado y farmacia"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "At least one expense field is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/expense/:id`

Propósito: eliminar gasto.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/expense/$env:EXPENSE_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IDENTIFIER",
    "message": "Expense ID is invalid",
    "status": 400,
    "details": {
      "field": "Expense ID"
    },
    "requestId": "request-id"
  }
}
```

### POST `/api/incomes`

Propósito: registrar ingreso.

Auth: sí.

Body:

```json
{
  "amount": 5000,
  "source": "Salary",
  "status": "confirmed",
  "date": "2026-05-01",
  "note": "Pago de nómina"
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/incomes" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"amount\":5000,\"source\":\"Salary\",\"status\":\"confirmed\",\"date\":\"2026-05-01\",\"note\":\"Pago de nómina\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68420",
  "userId": "68200d4d6c264c5f60f68401",
  "amount": 5000,
  "source": "Salary",
  "status": "confirmed",
  "date": "2026-05-01T00:00:00.000Z",
  "note": "Pago de nómina"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Source is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/incomes`

Propósito: listar ingresos del usuario.

Auth: sí.

Query params opcionales:

- `from`
- `to`
- `status`
- `source`

```powershell
curl.exe "$env:BASE_URL/api/incomes?from=2026-05-01&to=2026-05-31&status=confirmed" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
[
  {
    "_id": "68200d4d6c264c5f60f68420",
    "amount": 5000,
    "source": "Salary",
    "status": "confirmed",
    "date": "2026-05-01T00:00:00.000Z",
    "note": "Pago de nómina"
  }
]
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Status must be one of: pending, confirmed, cancelled",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/incomes/:id`

Propósito: obtener un ingreso específico.

Auth: sí.

```powershell
curl.exe "$env:BASE_URL/api/incomes/$env:INCOME_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68420",
  "amount": 5000,
  "source": "Salary",
  "status": "confirmed",
  "date": "2026-05-01T00:00:00.000Z",
  "note": "Pago de nómina"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Income not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PUT `/api/incomes/:id`

Propósito: actualizar ingreso.

Auth: sí.

```powershell
curl.exe -X PUT "$env:BASE_URL/api/incomes/$env:INCOME_ID" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"amount\":5200,\"note\":\"Pago ajustado\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68420",
  "amount": 5200,
  "source": "Salary",
  "status": "confirmed",
  "date": "2026-05-01T00:00:00.000Z",
  "note": "Pago ajustado"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "At least one income field is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/incomes/:id`

Propósito: eliminar ingreso.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/incomes/$env:INCOME_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Income not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### POST `/api/budget-periods`

Propósito: crear un periodo de presupuesto flexible.

Auth: sí.

Body:

```json
{
  "name": "Mayo 2026",
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "status": "active",
  "currency": "USD",
  "expenseToIncomeAlertThreshold": 0.8
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/budget-periods" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Mayo 2026\",\"startDate\":\"2026-05-01\",\"endDate\":\"2026-05-31\",\"status\":\"active\",\"currency\":\"USD\",\"expenseToIncomeAlertThreshold\":0.8}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68430",
  "userId": "68200d4d6c264c5f60f68401",
  "name": "Mayo 2026",
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-05-31T00:00:00.000Z",
  "status": "active",
  "currency": "USD",
  "expenseToIncomeAlertThreshold": 0.8
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "startDate must be earlier than or equal to endDate",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/budget-periods`

Propósito: listar periodos de presupuesto.

Auth: sí.

Query params opcionales:

- `status`

```powershell
curl.exe "$env:BASE_URL/api/budget-periods?status=active" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
[
  {
    "_id": "68200d4d6c264c5f60f68430",
    "name": "Mayo 2026",
    "startDate": "2026-05-01T00:00:00.000Z",
    "endDate": "2026-05-31T00:00:00.000Z",
    "status": "active",
    "currency": "USD"
  }
]
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Status must be one of: draft, active, archived",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/budget-periods/:id`

Propósito: obtener un periodo de presupuesto específico.

Auth: sí.

```powershell
curl.exe "$env:BASE_URL/api/budget-periods/$env:BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68430",
  "name": "Mayo 2026",
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-05-31T00:00:00.000Z",
  "status": "active",
  "currency": "USD"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Budget not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PUT `/api/budget-periods/:id`

Propósito: actualizar periodo de presupuesto.

Auth: sí.

```powershell
curl.exe -X PUT "$env:BASE_URL/api/budget-periods/$env:BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"status\":\"archived\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68430",
  "name": "Mayo 2026",
  "status": "archived",
  "currency": "USD"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "At least one budget field is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/budget-periods/:id`

Propósito: eliminar periodo de presupuesto y sus presupuestos por categoría relacionados.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/budget-periods/$env:BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Budget not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### POST `/api/category-budgets`

Propósito: crear presupuesto por categoría dentro de un periodo.

Auth: sí.

Body:

```json
{
  "budgetId": "68200d4d6c264c5f60f68430",
  "category": "Food",
  "limitAmount": 800,
  "alertThreshold": 0.8
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/category-budgets" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"budgetId\":\"$env:BUDGET_ID\",\"category\":\"Food\",\"limitAmount\":800,\"alertThreshold\":0.8}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68440",
  "userId": "68200d4d6c264c5f60f68401",
  "budgetId": "68200d4d6c264c5f60f68430",
  "category": "Food",
  "limitAmount": 800,
  "alertThreshold": 0.8
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "A category budget already exists for this budget and category",
    "status": 409,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/category-budgets`

Propósito: listar presupuestos por categoría del usuario.

Auth: sí.

Query params opcionales:

- `budgetId`

```powershell
curl.exe "$env:BASE_URL/api/category-budgets?budgetId=$env:BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
[
  {
    "_id": "68200d4d6c264c5f60f68440",
    "budgetId": "68200d4d6c264c5f60f68430",
    "category": "Food",
    "limitAmount": 800,
    "alertThreshold": 0.8
  }
]
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IDENTIFIER",
    "message": "Budget ID is invalid",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/category-budgets/:id`

Propósito: obtener un presupuesto por categoría específico.

Auth: sí.

```powershell
curl.exe "$env:BASE_URL/api/category-budgets/$env:CATEGORY_BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68440",
  "budgetId": "68200d4d6c264c5f60f68430",
  "category": "Food",
  "limitAmount": 800,
  "alertThreshold": 0.8
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Category budget not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### PUT `/api/category-budgets/:id`

Propósito: actualizar presupuesto por categoría.

Auth: sí.

```powershell
curl.exe -X PUT "$env:BASE_URL/api/category-budgets/$env:CATEGORY_BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"limitAmount\":900,\"alertThreshold\":0.9}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68440",
  "category": "Food",
  "limitAmount": 900,
  "alertThreshold": 0.9
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "At least one category budget field is required",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/category-budgets/:id`

Propósito: eliminar presupuesto por categoría.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/category-budgets/$env:CATEGORY_BUDGET_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Category budget not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/categories`

Propósito: listar categorías por defecto y personalizadas del usuario.

Auth: sí.

```powershell
curl.exe "$env:BASE_URL/api/categories" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
[
  {
    "id": null,
    "name": "Food",
    "isDefault": true
  },
  {
    "id": "68200d4d6c264c5f60f68450",
    "name": "Mascotas",
    "isDefault": false
  }
]
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token",
    "status": 401,
    "details": null,
    "requestId": "request-id"
  }
}
```

### POST `/api/categories`

Propósito: crear categoría personalizada.

Auth: sí.

Body:

```json
{
  "name": "Mascotas"
}
```

```powershell
curl.exe -X POST "$env:BASE_URL/api/categories" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Mascotas\"}"
```

Respuesta exitosa:

```json
{
  "_id": "68200d4d6c264c5f60f68450",
  "userId": "68200d4d6c264c5f60f68401",
  "name": "Mascotas",
  "normalizedName": "mascotas"
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Category already exists",
    "status": 409,
    "details": null,
    "requestId": "request-id"
  }
}
```

### DELETE `/api/categories/:id`

Propósito: eliminar categoría personalizada.

Auth: sí.

```powershell
curl.exe -X DELETE "$env:BASE_URL/api/categories/$env:CATEGORY_ID" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

- `204 No Content`

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Category not found",
    "status": 404,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/analytics/overview`

Propósito: resumen financiero completo por rango.

Auth: sí.

Query params:

- `from`
- `to`

```powershell
curl.exe "$env:BASE_URL/api/analytics/overview?from=2026-05-01&to=2026-05-31" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-31T00:00:00.000Z",
  "currency": "USD",
  "totalIncome": 5000,
  "totalExpense": 1800,
  "netBalance": 3200,
  "expenseToIncomeRatio": 0.36,
  "savingsRate": 0.64,
  "remainingBudget": 700,
  "categoryBreakdown": [],
  "overBudgetCategories": [],
  "periodCoverage": {
    "hasBudget": true,
    "budgetId": "68200d4d6c264c5f60f68430",
    "budgetName": "Mayo 2026",
    "currency": "USD",
    "totalBudget": 2500,
    "matchedBudgets": []
  }
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "from must be earlier than or equal to to",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/analytics/categories`

Propósito: desglose analítico por categoría.

Auth: sí.

Query params:

- `from`
- `to`

```powershell
curl.exe "$env:BASE_URL/api/analytics/categories?from=2026-05-01&to=2026-05-31" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-31T00:00:00.000Z",
  "currency": "USD",
  "categoryBreakdown": [
    {
      "category": "Food",
      "totalExpense": 800,
      "percentageOfExpense": 0.44,
      "percentageOfIncome": 0.16,
      "budgetedAmount": 900,
      "remainingBudget": 100,
      "usageRatio": 0.8889,
      "alertThreshold": 0.8,
      "isOverBudget": false
    }
  ],
  "overBudgetCategories": [],
  "periodCoverage": {
    "hasBudget": true
  }
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid token",
    "status": 401,
    "details": null,
    "requestId": "request-id"
  }
}
```

### GET `/api/analytics/alerts`

Propósito: consultar alertas de presupuesto y ratio gasto/ingreso.

Auth: sí.

Query params:

- `from`
- `to`

```powershell
curl.exe "$env:BASE_URL/api/analytics/alerts?from=2026-05-01&to=2026-05-31" `
  -H "Authorization: Bearer $env:TOKEN"
```

Respuesta exitosa:

```json
{
  "from": "2026-05-01T00:00:00.000Z",
  "to": "2026-05-31T00:00:00.000Z",
  "currency": "USD",
  "expenseToIncomeRatio": 0.36,
  "overBudgetCategories": [],
  "periodCoverage": {
    "hasBudget": true
  },
  "alerts": [
    {
      "type": "CATEGORY_BUDGET_THRESHOLD_REACHED",
      "category": "Food",
      "currentAmount": 800,
      "budgetedAmount": 900,
      "threshold": 0.8
    }
  ]
}
```

Error relevante:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "to is invalid",
    "status": 400,
    "details": null,
    "requestId": "request-id"
  }
}
```

## Flujos recomendados de uso

Flujo mínimo:

1. Registrar usuario.
2. Login y guardar token.
3. Crear ingresos del periodo.
4. Crear periodo de presupuesto.
5. Crear presupuestos por categoría.
6. Registrar gastos.
7. Consultar `overview`, `categories` y `alerts`.

Flujo rápido en PowerShell:

```powershell
$register = curl.exe -s -X POST "$env:BASE_URL/api/user/register" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Ana\",\"email\":\"ana@mail.com\",\"password\":\"Password123\",\"currency\":\"USD\"}" | ConvertFrom-Json

$env:TOKEN = $register.token
$env:USER_ID = $register.user.id

$income = curl.exe -s -X POST "$env:BASE_URL/api/incomes" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"amount\":5000,\"source\":\"Salary\",\"status\":\"confirmed\",\"date\":\"2026-05-01\"}" | ConvertFrom-Json

$budget = curl.exe -s -X POST "$env:BASE_URL/api/budget-periods" `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Mayo 2026\",\"startDate\":\"2026-05-01\",\"endDate\":\"2026-05-31\",\"status\":\"active\",\"currency\":\"USD\"}" | ConvertFrom-Json

$env:BUDGET_ID = $budget._id
```

## Checklist de pruebas manuales

- Registrar usuario nuevo.
- Intentar registrar el mismo email y validar `409`.
- Login correcto y login con contraseña inválida.
- Forzar varios intentos de login y validar `429`.
- Consultar endpoint protegido sin token y con token inválido.
- Crear gasto válido.
- Enviar JSON inválido y validar `400 MALFORMED_JSON`.
- Consultar un ObjectId inválido y validar `400 INVALID_IDENTIFIER`.
- Llamar una ruta inexistente y validar `404 ROUTE_NOT_FOUND`.
- Usar método no permitido en ruta válida y validar `405 METHOD_NOT_ALLOWED`.
- Crear ingreso + presupuesto + gasto y validar analítica.
- Verificar header `X-Request-Id` en respuestas exitosas y de error.
