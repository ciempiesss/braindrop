import type { Drop, Collection } from '@/types';

export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'qa-testing',
    name: 'QA Testing',
    description: 'Testing manual, automatización e-commerce',
    color: '#7c3aed',
    dropCount: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sql-apis',
    name: 'SQL & APIs',
    description: 'Bases de datos y APIs',
    color: '#2563eb',
    dropCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'filosofia',
    name: 'Filosofía',
    description: 'Spinoza, Deleuze, Guattari',
    color: '#dc2626',
    dropCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dev-jr',
    name: 'Dev JR',
    description: 'Desarrollo web junior',
    color: '#16a34a',
    dropCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Análisis de datos',
    color: '#ea580c',
    dropCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faggin',
    name: 'Federico Faggin',
    description: 'Ideas sobre consciencia y tecnología',
    color: '#0891b2',
    dropCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rotoplas',
    name: 'Rotoplas Onboarding',
    description: 'Todo lo que necesito saber del proyecto Rotoplace/Rotoplas',
    color: '#0ea5e9',
    dropCount: 24,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_DROPS: Drop[] = [
  // QA Testing - CON VISUALES ENRIQUECIDOS
  {
    id: 'q1',
    title: 'STLC: como un juego con 5 checkpoints',
    content: 'No puedes saltarte ninguno. Requirements → Planning → Design → Execution → Closure. Si te saltas Design y vas directo a ejecutar, es como ir al boss fight sin armas. Cada fase tiene su entregable: si no lo sacas, no avanzas.',
    type: 'definition',
    tags: ['qa', 'stlc', 'fundamentals'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'flow',
      nodes: [
        { label: 'Requirements', icon: '📋', color: '#7c3aed', desc: 'Análisis' },
        { label: 'Planning', icon: '📝', color: '#2563eb', desc: 'Plan' },
        { label: 'Design', icon: '🎨', color: '#06b6d4', desc: 'Casos' },
        { label: 'Execution', icon: '▶️', color: '#10b981', desc: 'Pruebas' },
        { label: 'Closure', icon: '🏁', color: '#f59e0b', desc: 'Reporte' }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q2',
    title: 'Severity vs Priority: no es lo mismo',
    content: 'El botón de pagar está roto = Critical severity + High priority (arregla YA). El logo se ve pixelado = Low severity + Low priority (nadie muere). El truco: severity la decides TÚ como tester. Priority la decide el negocio. A veces un bug feo técnicamente no es urgente, y viceversa.',
    type: 'definition',
    tags: ['qa', 'severity', 'priority', 'jira'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'matrix',
      items: [
        { severity: 'Critical', priority: 'Hotfix', bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
        { severity: 'High', priority: 'This Sprint', bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
        { severity: 'Medium', priority: 'Backlog', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
        { severity: 'Low', priority: 'Maybe', bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400' }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q3',
    title: 'Bug Report: La estructura profesional',
    content: 'Todo bug necesita: Summary | Pasos | Expected vs Actual | Environment | Evidencia.',
    type: 'definition',
    tags: ['qa', 'bug-report', 'jira'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'comparison',
      comparison: [
        { left: 'Summary', right: '[Módulo] Acción - Resultado' },
        { left: 'Steps', right: '1. Login 2. Click 3. Error' },
        { left: 'Expected', right: 'Redirige a pago' },
        { left: 'Actual', right: 'Botón no responde' },
        { left: 'Env', right: 'Chrome 120, Win11, Staging' }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q4',
    title: 'SQL: Validar Descuentos',
    content: 'Query para verificar que el descuento se aplicó correctamente en la base de datos.',
    type: 'code',
    tags: ['qa', 'sql', 'validation'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'code',
      code: `SELECT order_id, 
       original_price, 
       discount_amount, 
       final_price
FROM order_items 
WHERE order_id = 'ORD-2026-0211'
  AND final_price != (original_price - discount_amount);`
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q5',
    title: 'Happy Path: lo que nadie hace en la vida real',
    content: 'Happy Path = el flujo perfecto donde todo sale bien. Spoiler: los usuarios NUNCA siguen el happy path. Edge cases son lo que de verdad pasa: cupón expirado, stock 0 mientras pagas, sesión muerta, tarjeta rechazada. Si solo pruebas happy path, no estás testeando.',
    type: 'definition',
    tags: ['qa', 'test-cases', 'edge-cases'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'funnel',
      steps: [
        { label: 'Search', icon: '🔍', color: '#60a5fa' },
        { label: 'Cart', icon: '🛒', color: '#a78bfa' },
        { label: 'Checkout', icon: '💳', color: '#f472b6' },
        { label: 'Payment', icon: '💰', color: '#34d399' },
        { label: 'Done', icon: '✅', color: '#fbbf24' }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q6',
    title: 'Scrum vs Kanban: cuál te toca',
    content: 'Scrum = te dan 2 semanas, te comprometes a X tickets, y al final hay retro. Kanban = no hay sprints, los tickets llegan y los resuelves por orden de prioridad con límite de cuántos puedes tener a la vez. En Rotoplas usan algo híbrido. Lo importante: saber en qué sprint estás y qué se libera.',
    type: 'definition',
    tags: ['qa', 'agile', 'scrum', 'kanban'],
    collectionId: 'qa-testing',
    visualData: {
      type: 'comparison',
      comparison: [
        { left: 'Sprints', right: '2 semanas' },
        { left: 'Roles', right: 'Fijos' },
        { left: 'Planning', right: 'Estricta' },
        { left: 'WIP Limits', right: 'No aplica' },
        { left: 'Kanban:', right: 'Flujo continuo' },
        { left: 'Roles:', right: 'Flexibles' },
        { left: 'Planning:', right: 'No hay' },
        { left: 'WIP Limits:', right: 'Sí aplica' }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q2b',
    title: 'Severity vs Priority: la cheat sheet',
    content: 'Severity la pones tú: Critical (sistema muerto), High (feature rota), Medium (molesto), Low (cosmético). Priority la pone el negocio: Hotfix (ahora), High (este sprint), Medium (backlog), Low (quizás nunca). Un logo pixelado puede ser Low/Low. Un botón de pagar muerto es Critical/Hotfix.',
    type: 'definition',
    tags: ['qa', 'severity', 'priority', 'jira'],
    collectionId: 'qa-testing',
    visualContent: `┌─────────────────────────────────┐
│  SEVERITY (Técnico)  │ PRIORITY (Negocio)  │
├─────────────────────────────────┤
│ Critical → Arreglar   │ Hotfix → AHORA      │
│ High    → Pronto      │ High   → Este sprint │
│ Medium  → Planificar  │ Medium → Backlog    │
│ Low     → Cuando haya │ Low    → Nah        │
│         tiempo        │         → Quizás     │
└─────────────────────────────────┘`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q3b',
    title: 'Bug Report: si no lo pueden reproducir, no existe',
    content: 'Un bug report sin pasos claros es como decir "me duele algo". Summary = qué se rompió. Steps = cómo llegar ahí. Expected = qué debería pasar. Actual = qué pasa. Environment = Chrome/Firefox, QA/Prod. Evidencia = screenshot o video. Sin esto, el dev lo cierra con "works on my machine".',
    type: 'definition',
    tags: ['qa', 'bug-report', 'jira'],
    collectionId: 'qa-testing',
    visualContent: `📋 BUG REPORT TEMPLATE
─────────────────────────────
🎯 Summary:
[Modulo] Acción - Resultado

📝 Steps:
1. Login como user:test@mail.com
2. Agregar producto al carrito  
3. Click en "Pagar"

❌ Expected: Redirige a pago
✅ Actual: Botón no responde

🖥️ Env: Chrome 120, Win11, Staging
📎 Attach: screenshot.png`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q4b',
    title: 'SQL: cuando el front miente',
    content: 'La página dice $100. La base de datos dice $80. Quién tiene razón? La base de datos. Con un SELECT simple verificas si el descuento se aplicó bien, si el precio cambió, si la orden existe. No necesitas ser DBA, solo saber SELECT, WHERE y JOIN.',
    type: 'code',
    tags: ['qa', 'sql', 'validation'],
    collectionId: 'qa-testing',
    codeSnippet: `-- Verificar orden con descuento
SELECT order_id, 
       original_price, 
       discount_amount, 
       final_price
FROM order_items 
WHERE order_id = 'ORD-2026-0211'
  AND final_price != (original_price - discount_amount);

-- Si devuelve filas = BUG en matemáticas`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q5b',
    title: 'Edge Cases: donde viven los bugs de verdad',
    content: 'El happy path es aburrido: todo sale bien, fin. Los edge cases son donde brillas. Qué pasa si el cupón expiró hace 1 segundo? Si el stock llega a 0 mientras pagas? Si tu sesión muere en medio del checkout? Si pegas un script en el campo de nombre? Ahí están los bugs que importan.',
    type: 'definition',
    tags: ['qa', 'test-cases', 'edge-cases'],
    collectionId: 'qa-testing',
    visualContent: `🎯 FLUJO CHECKOUT E-COMMERCE
═══════════════════════════════

Happy Path:
User → Login → Browse → Cart → Checkout → Pay → Success

Edge Cases a testear:
├── Cupón expirado/válido/inválido
├── Stock 0 mientras agregas
├── Sesión expira en checkout
├── Timeout de pago
├──Método de pago rechazado
├── Descuento > total (negativo)
└── Usuario sin dirección`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q6b',
    title: 'Scrum vs Kanban: la diferencia en la práctica',
    content: 'Scrum: cada 2 semanas te comprometes a terminar X tickets. Hay planning, daily, retro. Kanban: no hay sprints, los tickets fluyen, y tienes un límite de cuántos puedes tener abiertos. En la vida real la mayoría de equipos hacen un Frankenstein de ambos.',
    type: 'definition',
    tags: ['qa', 'agile', 'scrum', 'kanban'],
    collectionId: 'qa-testing',
    visualContent: `┌──────────────┬──────────────┐
│    SCRUM    │    KANBAN   │
├──────────────┼──────────────┤
│ Sprints 2w  │ Flujo continuo│
│ Roles fixed │ No hay roles │
│ Planning    │ WIP limits   │
│ Retros      │ Mejora const │
│ Estimations │ Lead time    │
└──────────────┴──────────────┘`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q7',
    title: 'Postman: hablar con el backend sin front',
    content: 'El front puede mentir. Postman no. Le mandas un request directo al API y ves la respuesta cruda. GET = pedir datos, POST = crear algo, PUT = modificar, DELETE = borrar. Si Postman dice 200 pero el front muestra error, el bug está en el front. Si Postman dice 500, el backend está roto.',
    type: 'code',
    tags: ['qa', 'api', 'postman', 'automation'],
    collectionId: 'qa-testing',
    codeSnippet: `-- Ejemplos de requests
GET  /api/products/123    → Trae 1 producto
POST /api/cart/add        → Agrega al carrito
PUT  /api/orders/456/status → Actualiza estado
DELETE /api/cart/item/789 → Elimina item

-- Verificar respuesta
expect(response.status).toBe(200)
expect(response.body.total).toBeGreaterThan(0)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q8',
    title: 'Regression: lo nuevo rompió lo viejo?',
    content: 'Cada vez que los devs liberan algo nuevo, tienes que verificar que no rompieron lo que ya funcionaba. Actualizaron el checkout? Re-testea login, carrito, pagos anteriores, historial. Es como cuando actualizas tu teléfono y de repente el bluetooth no jala. Eso, pero en producción.',
    type: 'definition',
    tags: ['qa', 'regression', 'testing'],
    collectionId: 'qa-testing',
    visualContent: `🔄 REGRESSION CHECKLIST
═══════════════════════════════
After: Actualización módulo pagos

✓ Login funciona
✓ Carrito calcula bien  
✓ Checkout anterior (PayPal)
✓ Historial de órdenes
✓ Notificaciones email
✓ Descuentos aplican

Si todo pasa = ✅ Release
Si algo falla = ❌ Hotfix`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q9',
    title: 'Smoke Test: está vivo o está muerto?',
    content: '10-15 minutos. Login funciona? Homepage carga? Puedo buscar? Puedo agregar al carrito? Puedo llegar a checkout? Si UNO falla, paras todo y reportas. No tiene sentido probar 200 casos si ni siquiera puedes hacer login. Es el "¿prende?" antes de manejar.',
    type: 'definition',
    tags: ['qa', 'smoke', 'testing'],
    collectionId: 'qa-testing',
    visualContent: `🔥 SMOKE TEST (10-15 min)
─────────────────────────────

1. Login funciona
2. Homepage carga
3. Búsqueda retorna resultados
4. Carrito agrega producto
5. Checkout llega a pago

Si 1 falla = 🚫 STOP
Si 5/5 pasan = ✅ Continue`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q10',
    title: 'Selenium: un robot que clickea por ti',
    content: 'Escribes código que controla el navegador como si fuera un usuario. Click aquí, escribe esto, verifica que salga aquello. Sirve para no repetir 500 veces el mismo flujo de checkout. Python o JS son los lenguajes más comunes. Lo vas a necesitar cuando te metan automatización.',
    type: 'code',
    tags: ['qa', 'selenium', 'automation'],
    collectionId: 'qa-testing',
    codeSnippet: `// Ejemplo Selenium WebDriver (JS)
const { By, Builder } = require('selenium-webdriver');

async function testLogin() {
  let driver = new Builder()
    .forBrowser('chrome')
    .build();
  
  await driver.get('https://shop.com');
  
  // Find element and interact
  await driver.findElement(By.id('email'))
    .sendKeys('test@mail.com');
  
  await driver.findElement(By.id('password'))
    .sendKeys('pass123');
  
  await driver.findElement(By.css('.btn-login'))
    .click();
  
  // Assert
  let url = await driver.getCurrentUrl();
  return url.includes('/dashboard');
}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q11',
    title: 'POM: no repitas selectores 50 veces',
    content: 'Sin POM: copias driver.findElement(By.id("email")) en cada test. Con POM: lo defines UNA vez en una clase LoginPage y todos los tests lo usan. Si cambia el botón, cambias en 1 lugar, no en 50 archivos. Es el "no copies y pegues" de la automatización.',
    type: 'definition',
    tags: ['qa', 'pom', 'automation', 'patterns'],
    collectionId: 'qa-testing',
    visualContent: `📄 PAGE OBJECT MODEL
═══════════════════════════════

❌ SIN POM (código repetido):
driver.findElement(By.id('email')).sendKeys('x');
driver.findElement(By.id('btn-login')).click();

✅ CON POM:
class LoginPage {
  get email() { return By.id('email'); }
  get submit() { return By.id('btn-login'); }
  
  login(email, pass) {
    driver.findElement(this.email).sendKeys(email);
    driver.findElement(this.submit).click();
  }
}

// Test usa:
loginPage.login('test@mail.com', 'pass');`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q12',
    title: 'Test Case: la receta que otro QA puede seguir',
    content: 'Si te atropella un camión, ¿otro QA puede repetir tu prueba? Un test case bien escrito tiene: ID, precondición (usuario logueado, producto en carrito), pasos exactos (1. ir a /cart, 2. aplicar cupón X), resultado esperado (total = $80). Si no tiene esto, no es test case, es vibes.',
    type: 'definition',
    tags: ['qa', 'test-cases', 'e-commerce'],
    collectionId: 'qa-testing',
    visualContent: `📋 EJEMPLO TEST CASE
═══════════════════════════════
ID: TC-045 - Cupón Descuento

PRECONDICIÓN:
Usuario logueado, producto $100 en carrito

PASOS:
1. Ir a /cart
2. Ingresar código "SAVE20"
3. Click "Aplicar"

RESULTADO ESPERADO:
✓ Msg: "Cupón aplicado"
✓ Total: $80
✓ Detalle: $100 - $20 = $80

VALIDACIÓN SQL:
discount_amount = 20 ✓`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q13',
    title: '80% de los bugs vienen del 20% del código',
    content: 'No pruebes todo igual. El checkout tiene 10x más bugs que la página de "Sobre nosotros". Enfoca tu energía en: código nuevo (nadie lo ha probado), módulos con historial de bugs (reincidentes), pagos (dinero real), y auth (si se rompe, nada funciona).',
    type: 'insight',
    tags: ['qa', 'strategy', 'risk-based'],
    collectionId: 'qa-testing',
    visualContent: `📊 WHERE TO FOCUS
═══════════════════════════════

🔴 ZONA ALTA PRIORIDAD:
├── Código nuevo (alto riesgo)
├── Módulos con historial de bugs
├── Checkout / Pago (revenue)
├── Login / Auth (bloqueante)
└── Integraciones externas

🟡 ZONA MEDIA:
├── Perfil de usuario
├── Búsqueda / Filtros
└── Notificaciones

🟢 ZONA BAJA:
├── Footer / Header
├── Página 404
└── Static pages`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q14',
    title: 'Assertion vs Verification: parar o seguir?',
    content: 'Assertion = encuentras error, todo para. Útil para cosas críticas: si no puedo hacer login, para qué sigo? Verification = encuentras error, lo anotas y sigues. Útil para checklists: "la imagen no carga, pero sigo probando el resto". Saber cuándo usar cuál es la diferencia entre junior y mid.',
    type: 'definition',
    tags: ['qa', 'assertion', 'automation'],
    collectionId: 'qa-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q15',
    title: 'Eres QA, no solo tester',
    content: 'Tester = ejecuto pruebas, encuentro bugs, reporto. QA = pienso en calidad desde el principio. Cuando lees un requerimiento y dices "esto va a fallar si..." eso es QA. No esperas a que lo construyan para encontrar el error. Lo previenes antes de que exista.',
    type: 'insight',
    tags: ['qa', 'mindset', 'culture'],
    collectionId: 'qa-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q16',
    title: 'No hay tiempo? Prueba lo que más duele',
    content: 'Nunca hay tiempo para probar todo. Pregunta mágica: "si esto falla en producción, ¿cuánto dinero se pierde?" Checkout roto = miles de pesos perdidos por hora. Footer roto = a nadie le importa. Prueba primero lo que más duele al negocio.',
    type: 'definition',
    tags: ['qa', 'strategy', 'risk'],
    collectionId: 'qa-testing',
    visualContent: `⚖️ RISK MATRIX
═══════════════════════════════

         │ Alta Prob │ Baja Prob │
─────────┼───────────┼───────────┤
Alto     │ PRUEBA   │ PRUEBA   │
Impacto  │ AHORA    │ DESPUÉS  │
─────────┼───────────┼───────────┤
Bajo     │ PRUEBA   │ IGNORA   │
Impacto  │ DESPUÉS  │ o SKIP   │
─────────┴───────────┴───────────┘`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q17',
    title: 'TestRail / Zephyr: tu Excel con esteroides',
    content: 'Imagina tu Excel de test cases pero que se conecta con Jira, genera reportes automáticos y te dice qué falta por probar. TestRail = cloud independiente. Zephyr = vive dentro de Jira. En Rotoplas usan Excel + Jira, pero saber que esto existe te pone un paso adelante.',
    type: 'definition',
    tags: ['qa', 'testrail', 'zephyr', 'tools'],
    collectionId: 'qa-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: 'q18',
    title: 'Manual testing es tu superpoder',
    content: 'La automatización repite lo que le programas. Tú encuentras lo que nadie programó. "Qué pasa si pego emojis en el campo de dirección?" "Qué pasa si abro 2 tabs del checkout?" Esa curiosidad caótica es exactamente lo que hace falta. La automatización complementa, no reemplaza.',
    type: 'hook',
    tags: ['qa', 'manual', 'automation'],
    collectionId: 'qa-testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // SQL & APIs
  {
    id: '7',
    title: 'JOINs: cruzar dos playlists',
    content: 'Tienes playlist A y playlist B. INNER JOIN = solo las canciones que están en AMBAS. LEFT JOIN = toda la playlist A + las que coinciden con B. RIGHT JOIN = toda B + coincidencias con A. FULL = todas de ambas. En QA: JOIN para cruzar órdenes con pagos y ver si coinciden.',
    type: 'definition',
    tags: ['sql', 'databases'],
    collectionId: 'sql-apis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '8',
    title: 'REST vs SOAP: WhatsApp vs carta certificada',
    content: 'REST = mandas un mensaje rápido en JSON, recibes respuesta, listo. SOAP = mandas un sobre XML con 47 sellos, certificaciones y acuse de recibo. Las empresas viejas (bancos, gobierno) usan SOAP. El 95% del mundo moderno usa REST. Rotoplas usa REST con Commerce Tools.',
    type: 'definition',
    tags: ['apis', 'rest', 'soap'],
    collectionId: 'sql-apis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '9',
    title: 'HTTP status codes: los únicos que importan',
    content: '200 = todo bien. 201 = se creó algo. 400 = mandaste basura. 401 = no estás logueado. 403 = logueado pero sin permiso. 404 = eso no existe. 500 = el servidor explotó. Cuando veas un 500 en Network tab de DevTools, es bug del backend garantizado.',
    type: 'trivia',
    tags: ['apis', 'http', 'basics'],
    collectionId: 'sql-apis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '10',
    title: 'N+1: cuando la página tarda 30 segundos',
    content: 'Imagina que para mostrar 100 productos, el sistema hace 1 query para la lista + 100 queries individuales para el precio de cada uno. 101 queries. Por eso la página tarda una eternidad. Solución: un solo JOIN que trae todo junto. Si ves una página lenta, este puede ser el porqué.',
    type: 'definition',
    tags: ['sql', 'performance', 'backend'],
    collectionId: 'sql-apis',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // Filosofía
  {
    id: '11',
    title: 'Spinoza: Dios no está arriba, es TODO',
    content: 'Deus sive Natura = Dios O la Naturaleza. No "Dios Y la naturaleza". Son lo mismo. No hay un viejo en las nubes mirándote. El universo entero, cada átomo, cada pensamiento, es Dios expresándose. Te excomulgaron de la sinagoga por decir esto en 1656. Hoy la física cuántica le da la razón.',
    type: 'definition',
    tags: ['filosofia', 'spinoza', 'metafisica'],
    collectionId: 'filosofia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '12',
    title: 'Spinoza: la alegría te hace más poderoso',
    content: 'Los afectos no son "sentimientos bonitos". Son cambios reales en tu capacidad de actuar. Alegría = tu potencia aumenta, puedes hacer más. Tristeza = tu potencia disminuye, te paralizas. Por eso scrollear redes te deja vacío: tristeza pasiva que te quita potencia de actuar.',
    type: 'insight',
    tags: ['filosofia', 'spinoza', 'etica'],
    collectionId: 'filosofia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '13',
    title: 'Rizoma: el conocimiento no es un árbol',
    content: 'Te enseñaron que el conocimiento es un árbol: tronco → ramas → hojas. Deleuze dice que no. Es un rizoma: cualquier punto conecta con cualquier otro. Spinoza conecta con programación conecta con QA conecta con tinacos. BrainDrop ES un rizoma. Las redes sociales fingen serlo pero son árboles algorítmicos.',
    type: 'definition',
    tags: ['filosofia', 'deleuze', 'guattari'],
    collectionId: 'filosofia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '14',
    title: 'Líneas de fuga: las grietas del sistema',
    content: 'Todo sistema cerrado tiene puntos por donde se escapa algo nuevo. Tu trabajo corporativo tiene una línea de fuga: esta app. Las redes sociales tienen una: usarlas para aprender en vez de consumir. No destruyes el sistema, encuentras la grieta y creas algo diferente desde ahí.',
    type: 'insight',
    tags: ['filosofia', 'deleuze', 'guattari'],
    collectionId: 'filosofia',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // Dev JR
  {
    id: '15',
    title: 'Git: fotos, no diferencias',
    content: 'Git no guarda "qué cambió". Guarda una foto completa del proyecto en cada commit. Cada foto apunta a la anterior. Una rama es solo un post-it que dice "estoy aquí". Cuando haces merge, pegas dos líneas de fotos. Si entiendes esto, entiendes el 80% de git.',
    type: 'definition',
    tags: ['git', 'dev', 'basics'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '16',
    title: 'DRY: no copies y pegues (casi nunca)',
    content: 'Si copias y pegas código 3 veces, haz una función. PERO: si lo copias 2 veces y cada caso es ligeramente diferente, déjalo. Abstraer demasiado pronto es peor que repetir. Primero que funcione, luego que sea bonito.',
    type: 'definition',
    tags: ['dev', 'principios', 'clean-code'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '17',
    title: 'Async/Await: callbacks pero legibles',
    content: 'Antes: callback dentro de callback dentro de callback (pirámide de la muerte). Ahora: await. Misma lógica, pero se lee de arriba a abajo como código normal. const data = await fetch(url). Sin .then().then().then(). Es azúcar sintáctica pero tu cerebro te lo agradece.',
    type: 'connection',
    tags: ['javascript', 'async', 'evolution'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '18',
    title: 'La terminal: incómoda 1 semana, invaluable después',
    content: 'Cada vez que sacas la mano del teclado para usar el mouse, pierdes 2 segundos. Parece nada. Hazlo 500 veces al día = 16 minutos. Hazlo 1 año = 70 horas perdidas. La terminal es fea pero rápida. git, npm, scripts, todo sin mouse. 1 semana de dolor, años de velocidad.',
    type: 'insight',
    tags: ['dev', 'productivity', 'terminal'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '30',
    title: 'Variable: un cajón con nombre',
    content: 'const edad = 25. Guardaste 25 en un cajón que se llama "edad". const = el cajón está sellado, no cambias el valor. let = puedes cambiar lo que hay adentro. Usa const por defecto, let solo cuando NECESITES que cambie. var no existe, olvídalo.',
    type: 'definition',
    tags: ['javascript', 'basics', 'variables'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '31',
    title: 'Función: un botón que hace algo',
    content: 'Le das ingredientes (parámetros), hace algo con ellos (lógica), y te devuelve un resultado (return). calcularIVA(100) → 116. La defines una vez y la usas mil. Si estás copiando las mismas 5 líneas en 3 lugares, necesitas una función.',
    type: 'definition',
    tags: ['javascript', 'basics', 'functions'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '32',
    title: 'Array: una fila donde el primero es el 0',
    content: 'const productos = ["tinaco", "filtro", "bomba"]. productos[0] = "tinaco". Sí, empieza en 0, no en 1. Es raro pero te acostumbras. .push() agrega al final, .pop() quita el último, .length te dice cuántos hay. El 90% de lo que haces con datos es recorrer arrays.',
    type: 'definition',
    tags: ['javascript', 'basics', 'arrays'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '33',
    title: 'Objeto: una ficha técnica',
    content: 'const orden = { id: "U47", total: 5000, pagado: true }. Accedes con orden.total o orden["total"]. Es como una ficha: tiene campos y valores. Todo en JS es un objeto disfrazado. Cuando ves la respuesta de un API, es un objeto JSON.',
    type: 'definition',
    tags: ['javascript', 'basics', 'objects'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '34',
    title: 'If/Else: la computadora toma decisiones',
    content: 'if (monto >= 5000) { mostrarEfectivo() } else { ocultarEfectivo() }. Así es como Rotoplas decide si mostrarte la opción de pago en efectivo. Todo comportamiento condicional en software es un if/else disfrazado.',
    type: 'definition',
    tags: ['javascript', 'basics', 'conditionals'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '35',
    title: 'Loops: hacer lo mismo 1000 veces sin quejarse',
    content: 'for (let i = 0; i < productos.length; i++) { verificarPrecio(productos[i]) }. Acabas de verificar el precio de TODOS los productos en 3 líneas. .forEach() y .map() hacen lo mismo pero más bonito. Los loops son la razón por la que las computadoras son útiles.',
    type: 'definition',
    tags: ['javascript', 'basics', 'loops'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '36',
    title: 'HTTP: pides y te dan (o no)',
    content: 'Tu navegador pide (request), el servidor responde (response). Cada petición es independiente: el servidor no recuerda quién eres entre peticiones. Por eso existen las cookies y tokens: para que el servidor sepa que sigues siendo tú. Cada click que haces en Rotoplace es un request HTTP.',
    type: 'definition',
    tags: ['http', 'web', 'basics'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '37',
    title: 'API: no necesitas saber cómo cocina',
    content: 'Le dices al API "dame los productos con SKU 1234" y te devuelve los datos. No te importa si los sacó de PostgreSQL, de un archivo o de la nada. Solo importa: qué le pides (request) y qué te da (response). Commerce Tools tiene un API. Open Pay tiene otro. Tu trabajo es verificar que respondan bien.',
    type: 'analogy',
    tags: ['apis', 'backend', 'basics'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '38',
    title: 'Git: editas, preparas, guardas',
    content: '3 zonas. Working = donde editas archivos. Staging = lo que elegiste guardar (git add). Repository = el historial sellado (git commit). Si editas 10 archivos pero solo haces add de 3, el commit solo guarda esos 3. Es como elegir qué fotos subes al álbum.',
    type: 'definition',
    tags: ['git', 'version-control', 'basics'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '39',
    title: 'DOM: la página es un árbol de cajas',
    content: 'El HTML que escribes se convierte en un árbol de objetos en memoria. &lt;div&gt; contiene &lt;p&gt; que contiene texto. JavaScript modifica ese árbol y el navegador re-dibuja. Cuando inspeccionas un elemento con F12, estás viendo el DOM. Cuando un botón no responde, algo en el DOM está roto.',
    type: 'definition',
    tags: ['javascript', 'dom', 'web'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '40',
    title: 'npm: la tienda de código gratis',
    content: 'npm install tailwindcss. Acabas de descargar el trabajo de cientos de personas en 5 segundos. package.json es tu lista de compras: dice qué instalaste y qué versión. node_modules es el refrigerador: ahí vive todo lo descargado. Nunca subas node_modules a git.',
    type: 'definition',
    tags: ['javascript', 'npm', 'devtools'],
    collectionId: 'dev-jr',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // Data Analyst
  {
    id: '19',
    title: 'Media vs Mediana: cuál miente',
    content: '10 personas ganan $10k. Llega Elon Musk ganando $10M. La media sube a $900k. "En promedio ganan casi un millón!" Mentira. La mediana sigue en $10k porque es el valor del medio. Cuando alguien te da un "promedio", pregunta si hay outliers. Casi siempre los hay.',
    type: 'definition',
    tags: ['data', 'statistics', 'basics'],
    collectionId: 'data-analyst',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '20',
    title: 'Correlación ≠ Causación: el error que todos cometen',
    content: 'Las ventas de helados suben al mismo tiempo que los ahogamientos. ¿Los helados causan ahogamientos? No. El verano causa ambos. Tercer factor invisible. Cuando te digan "X causa Y" porque suben juntos, pregunta: ¿hay algo más que cause los dos? Casi siempre lo hay.',
    type: 'insight',
    tags: ['data', 'statistics', 'critical-thinking'],
    collectionId: 'data-analyst',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // Federico Faggin
  {
    id: '21',
    title: 'Faggin creó el primer microprocesador y luego dijo: no es suficiente',
    content: 'Diseñó el Intel 4004, el primer chip que hizo posible las computadoras personales. Luego dedicó su vida a demostrar que ningún chip puede replicar la consciencia. La tecnología amplifica lo que ya eres. No crea lo que no eres. El creador del procesador te dice que el procesador tiene límites.',
    type: 'insight',
    tags: ['faggin', 'technology', 'philosophy'],
    collectionId: 'faggin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '22',
    title: 'ChatGPT es inteligente pero no siente nada',
    content: 'Inteligencia = procesar información y resolver problemas. Consciencia = SENTIR que estás resolviendo algo. Una calculadora suma perfecto pero no "siente" los números. Faggin dice que la IA puede ser infinitamente inteligente y seguir siendo un zombie filosófico. Tú sientes. Eso es otra cosa.',
    type: 'hook',
    tags: ['faggin', 'consciousness', 'ai'],
    collectionId: 'faggin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '23',
    title: 'La máquina no "piensa en" nada',
    content: 'Tú piensas EN algo. Tu pensamiento es SOBRE tu trabajo, SOBRE una persona. Las máquinas procesan símbolos sin saber qué significan. Es como alguien que traduce chino con un diccionario sin saber chino: manipula símbolos correctamente pero no entiende nada. Searle le llamó "la habitación china".',
    type: 'definition',
    tags: ['faggin', 'philosophy-of-mind', 'ai'],
    collectionId: 'faggin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // General
  {
    id: '24',
    title: 'Closure: la función que recuerda de dónde viene',
    content: 'Creas una función dentro de otra. La función interna "recuerda" las variables de la externa aunque la externa ya murió. Es como un hijo que hereda los recuerdos del padre. Es confuso la primera vez, pero es la base de React hooks, event handlers, y medio JavaScript moderno.',
    type: 'definition',
    tags: ['javascript', 'programming'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '25',
    title: 'El cerebro es un bosque',
    content: 'Cada pensamiento es un camino. Los usados más se vuelven senderos claros. Los abandonados desaparecen. Neuroplasticidad = jardinería mental.',
    type: 'analogy',
    tags: ['neuroscience', 'learning', 'productivity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '26',
    title: 'Cielo azul vs atardecer rojo',
    content: 'Misma luz del sol, diferente ángulo y distancia. Más dispersión en atardecer = colores diferentes.',
    type: 'hook',
    tags: ['physics', 'curiosity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '27',
    title: '98% de tus átomos se renuevan',
    content: 'Eres literalmente diferente cada 12 meses. Lo que eres no es la materia, es el patrón.',
    type: 'trivia',
    tags: ['biology', 'identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '28',
    title: 'Bach ≈ Fractales',
    content: 'Fugas repiten patrones a diferentes escalas, como fractales. Mismo principio: auto-similitud a cualquier nivel.',
    type: 'connection',
    tags: ['music', 'math', 'patterns'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '29',
    title: 'Procrastinación no es pereza',
    content: 'Es regulación emocional. Evitas la tarea porque evitas la emoción negativa asociada. Curar = cambiar cómo te sientes sobre la tarea.',
    type: 'insight',
    tags: ['psychology', 'productivity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },

  // ═══ ROTOPLAS ONBOARDING ═══
  {
    id: 'r1',
    title: 'El mapa del proyecto: 3 mundos en Jira',
    content: 'Piensa en Rotoplas como 3 videojuegos distintos en la misma consola. Dev Interno = herramientas de la casa. DPM = el sistema que controla precios de tinacos/cisternas. E-commerce = la tienda B2B+B2C donde pasan las ventas reales. Si abres un ticket en el proyecto equivocado, nadie lo va a ver.',
    type: 'definition',
    tags: ['rotoplas', 'jira', 'proyectos', 'mapa'],
    collectionId: 'rotoplas',
    visualData: {
      type: 'flow',
      nodes: [
        { label: 'Dev Interno', icon: '🔧', color: '#7c3aed', desc: 'Tools internos' },
        { label: 'DPM', icon: '💰', color: '#f59e0b', desc: 'Precios tinacos' },
        { label: 'E-commerce', icon: '🛒', color: '#10b981', desc: 'B2B + B2C' },
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r2',
    title: 'El bug que casi mata al negocio',
    content: 'Imagina que vendes instalación de tinacos pero solo puedes instalar en CDMX. Ahora imagina que tu sistema deja comprar desde Cancún. Eso pasó. Vendían a cualquier CP del país y no podían cumplir. Ahora está restringido a CDMX, pero solo para servicios (lavado, instalación). Productos sueltos como un filtro de agua sí se envían a donde sea.',
    type: 'hook',
    tags: ['rotoplas', 'restricciones', 'cp', 'leccion'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r3',
    title: 'El dinero se mueve por Open Pay',
    content: 'Todo pago pasa por Open Pay. B2C acepta tarjeta, efectivo, transferencia y crédito Rotoplace. Truco: el pago en efectivo SOLO aparece si el carrito suma $5,000+. Quitas un producto, baja de $5,000, y la opción desaparece. Esto no es bug, es regla de negocio.',
    type: 'definition',
    tags: ['rotoplas', 'pagos', 'openpay', 'reglas'],
    collectionId: 'rotoplas',
    visualData: {
      type: 'comparison',
      comparison: [
        { left: 'B2C', right: 'Tarjeta, efectivo*, transferencia, crédito' },
        { left: 'B2B', right: 'Tarjeta, transferencia, efectivo' },
        { left: 'Efectivo', right: 'Solo si carrito ≥ $5,000' },
        { left: 'Verificar', right: 'Open Pay con el correo CORRECTO' },
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r4',
    title: 'Error #1 que vas a cometer: el correo',
    content: 'Vas a buscar un pago en Open Pay, no va a aparecer, y vas a pensar que algo se rompió. No. Estás en el correo equivocado. B2B y B2C tienen correos separados. Si la orden fue B2B, búscala con el correo B2B. Suena tonto hasta que te pasa 3 veces.',
    type: 'hook',
    tags: ['rotoplas', 'openpay', 'correos', 'survival'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r5',
    title: 'Quién es quién (tu supervivencia depende de esto)',
    content: 'Verito (Verónica Romero) manda. Ella te dice qué hacer y por chat personal. César Bautista está en tu misma posición, apóyense. Francisco Abel mueve las órdenes de lavado. Perla = tu jefa para DPM. Amy = tu jefa para B2B/B2C. Luz Cortés = la dev del DPM, consultora de Sideral como tú.',
    type: 'definition',
    tags: ['rotoplas', 'equipo', 'personas', 'clave'],
    collectionId: 'rotoplas',
    visualData: {
      type: 'list',
      nodes: [
        { label: 'Verito', icon: '👑', color: '#7c3aed', desc: 'Coordina todo tu trabajo' },
        { label: 'César', icon: '🤝', color: '#2563eb', desc: 'Tu par, apóyense' },
        { label: 'Francisco Abel', icon: '🔧', color: '#10b981', desc: 'Avanza órdenes de lavado' },
        { label: 'Perla', icon: '📊', color: '#f59e0b', desc: 'Reportas DPM' },
        { label: 'Amy', icon: '🛒', color: '#ec4899', desc: 'Reportas B2B/B2C' },
        { label: 'Luz Cortés', icon: '💻', color: '#06b6d4', desc: 'Dev DPM, tu aliada' },
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r6',
    title: 'Dónde vives: QA, Distribuidores, Producción',
    content: '3 ambientes, sin VPN, directo en el navegador. QA para romper cosas. Distribuidores (también QA) para probar B2B. Producción de Rotoplace para verificar que lo que liberaron funciona de verdad. Por ahora solo pruebas manuales, pero seguro te meten automatización pronto.',
    type: 'definition',
    tags: ['rotoplas', 'ambientes', 'qa', 'setup'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r7',
    title: 'Setup día 1: los 3 correos sagrados',
    content: 'Necesitas crear 3 correos nuevos antes de hacer nada. Con ellos recibes invitaciones B2B y B2C, abres Open Pay y entras a JIRA. IMPORTANTE: configura tu cuenta como superusuario o no verás todas las órdenes. Si ves un error de "correo no asociado", es porque falta esto.',
    type: 'definition',
    tags: ['rotoplas', 'setup', 'correos', 'dia-uno'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r8',
    title: 'El catálogo: SKUs y la lógica padre-hijo',
    content: 'Todo producto tiene un SKU padre y variantes (2, 3, 4). Es como una familia: el tinaco 1100L es el padre, y sus colores/versiones son los hijos. Se venden tinacos, cisternas, filtros, calentadores, purificadores + servicios de lavado e instalación. Los precios viven en Commerce Tools, no en el front.',
    type: 'analogy',
    tags: ['rotoplas', 'productos', 'sku', 'catalogo'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r9',
    title: 'B2B y B2C: la misma tienda, dos realidades',
    content: 'B2C = tú comprando un tinaco para tu casa. B2B = una ferretería comprando 50 tinacos a precio de mayoreo. Mismo sistema, diferentes precios, diferentes correos, diferentes ambientes. Los distribuidores B2B se gestionan en Commerce Tools → Business Unit, donde les pones rol de comprador u operador.',
    type: 'analogy',
    tags: ['rotoplas', 'b2b', 'b2c', 'concepto'],
    collectionId: 'rotoplas',
    visualData: {
      type: 'comparison',
      comparison: [
        { left: 'B2C', right: 'Menudeo, cliente final, Rotoplace' },
        { left: 'B2B', right: 'Mayoreo, distribuidores, precios especiales' },
        { left: 'Gestión', right: 'Commerce Tools → Business Unit' },
        { left: 'Roles', right: 'Comprador u Operador' },
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r10',
    title: 'La vida de una orden (y cómo muere)',
    content: 'Pedido → Confirmar en "proceso" → Recargar → Se refleja en B2C → Subir foto de entrega → Entregado. Si no la avanzas, se cancela sola por vigencia. Excepción: las órdenes de lavado las avanza Francisco Abel, no tú. Es como un Tamagotchi: si no lo alimentas, se muere.',
    type: 'analogy',
    tags: ['rotoplas', 'ordenes', 'flujo', 'ciclo-vida'],
    collectionId: 'rotoplas',
    visualData: {
      type: 'flow',
      nodes: [
        { label: 'Pedido', icon: '🛒', color: '#60a5fa' },
        { label: 'Confirmar', icon: '✅', color: '#a78bfa' },
        { label: 'Envío', icon: '📦', color: '#f59e0b' },
        { label: 'Foto', icon: '📸', color: '#34d399' },
        { label: 'Entregado', icon: '🏁', color: '#10b981' },
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r11',
    title: 'DPM: el módulo maldito',
    content: 'El Dynamic Price Manager controla precios de tinacos y cisternas. Se actualiza cada ~3 días. Tiene un bug que nadie arregla: cuando subes precios masivos por CSV y hay un error (ej: falta el precio), el historial dice "subido con éxito" pero no descarga el CSV con los errores. Habla con Luz Cortés, la dev.',
    type: 'hook',
    tags: ['rotoplas', 'dpm', 'bugs', 'conocido'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r12',
    title: 'Vulnerabilidad activa: órdenes sin auth',
    content: 'Cualquiera puede ver la orden de otro usuario. Sin login. Solo necesitas adivinar el número de pedido. Esto está en producción ahora mismo. Si te preguntan por qué es grave: imagina que un competidor ve todos los pedidos de distribuidores con precios de mayoreo.',
    type: 'hook',
    tags: ['rotoplas', 'seguridad', 'vulnerabilidad', 'critico'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r13',
    title: 'Regla de oro: guarda cada número de orden',
    content: 'No hay buen buscador de órdenes. Si pierdes el número, lo perdiste. Hazte un Excel/Notion con: número de orden, fecha, tipo (B2B/B2C), método de pago, correo usado. Tu yo del futuro te va a querer mucho.',
    type: 'insight',
    tags: ['rotoplas', 'organizacion', 'ordenes', 'survival'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r14',
    title: 'La cultura real del equipo',
    content: 'El testing no es difícil: flujos de carrito, subir tickets, verificar pagos. Lo difícil es el retrabajo: gerencia pide tickets, los devuelve, los pide diferente. En releases hay sesiones de 8am a 9pm. 2 dailies (e-commerce + Keirus). Teamback 7:45am opcional. Rotoplas sale a las 3pm, tú no. Bienvenido a consultoría.',
    type: 'insight',
    tags: ['rotoplas', 'cultura', 'realidad', 'consultoria'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r15',
    title: 'CFDI: con o sin factura',
    content: 'En checkout eliges factura (CFDI) o sin ella. Manual o automático, pero el automático a veces falla o tarda. Para pruebas da igual cuál elijas. Lo importante: si un cliente dice "mi factura no se generó", ya sabes que es un bug conocido.',
    type: 'definition',
    tags: ['rotoplas', 'facturacion', 'cfdi'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r16',
    title: 'Jira + Excel = tu sistema nervioso',
    content: 'Los tickets van en Jira, pero hay 2 matrices Excel: una general con todos los casos (se clona para producción) y otra específica para liberaciones. Dato: hubo un bug donde compra en efectivo aparecía como tarjeta en la notificación. Los 4 correos de notificación de pedidos son tu checklist.',
    type: 'definition',
    tags: ['rotoplas', 'jira', 'excel', 'proceso'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },

  // ═══ SURVIVAL KIT QA (lo que la transcripción no dice pero necesitas) ═══
  {
    id: 'r17',
    title: 'F12 antes de reportar cualquier bug',
    content: 'Abres DevTools (F12), tab Network, reproduces el error. Si el API devuelve 400/500, copias el request y response. Tu bug report pasa de "no funciona el botón" a "el endpoint /api/orders devuelve 500 con este payload". Adivina cuál resuelven primero.',
    type: 'hook',
    tags: ['rotoplas', 'devtools', 'bug-reports', 'nivel-pro'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r18',
    title: 'Captura PRIMERO, reporta DESPUÉS',
    content: 'Los bugs son como fantasmas: aparecen y desaparecen. El segundo que veas algo raro, screenshot o video. ShareX captura con un atajo. Grabas pantalla con OBS o el grabador de Windows (Win+G). Sin evidencia no hay bug, solo tu palabra.',
    type: 'insight',
    tags: ['rotoplas', 'evidencia', 'herramientas', 'dia-uno'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r19',
    title: 'Commerce Tools = la verdad absoluta',
    content: 'Si el front dice que un tinaco cuesta $3,000 pero Commerce Tools dice $2,800, el bug está en el front. Commerce Tools tiene la lista de productos, variantes por SKU, Business Units, y el estado real de cada orden. Cuando dudes, ve ahí.',
    type: 'definition',
    tags: ['rotoplas', 'commerce-tools', 'fuente-verdad'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r20',
    title: 'Open Pay: dónde buscar cada tipo de pago',
    content: 'Efectivo → sección Painet. Tarjeta → sección tarjetas y pagos. No es intuitivo. Si no encuentras un pago, checklist rápido: ¿correo correcto? ¿sección correcta? ¿procesó el pago o quedó pendiente? La mayoría de "bugs de pago" son errores de búsqueda.',
    type: 'definition',
    tags: ['rotoplas', 'openpay', 'painet', 'busqueda'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r21',
    title: 'Pregunta antes de escribir un ticket',
    content: 'La gerencia devuelve tickets porque "no es lo que pedían". La solución es estúpidamente simple: antes de escribir 30 min un ticket, pregunta 5 min qué esperan exactamente. Pide el criterio de aceptación. Si no lo tienen claro ellos, no es tu problema definirlo.',
    type: 'insight',
    tags: ['rotoplas', 'tickets', 'comunicacion', 'supervivencia'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r22',
    title: 'El wizard de lavados: su propio universo',
    content: 'Los lavados no son como comprar un producto. Vas al wizard, cotizas, agregas hasta 3 servicios, y la orden la avanza Francisco Abel (no tú). Si el botón de programar lavado se puede clickear múltiples veces = bug (ya lo corrigieron una vez, puede regresar).',
    type: 'definition',
    tags: ['rotoplas', 'lavados', 'wizard', 'flujo-especial'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r23',
    title: 'Se puede comprar sin login (y es raro)',
    content: 'Puedes hacer pedido sin cuenta en Rotoplace. Pero no ves la orden en tu historial hasta el final. Para testing: siempre logueado, es más rastreable. Los datos de tarjetas de prueba los tiene Verito.',
    type: 'trivia',
    tags: ['rotoplas', 'checkout', 'guest', 'testing'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
  {
    id: 'r24',
    title: 'Las matemáticas del checkout: IVA + descuento',
    content: 'Precio base + 16% IVA - descuento = total. Suena fácil hasta que no cuadra. Valida siempre: ¿el front muestra el mismo total que Commerce Tools? ¿El IVA se calcula antes o después del descuento? Si las matemáticas no dan, hay bug en la lógica de precios.',
    type: 'insight',
    tags: ['rotoplas', 'precios', 'iva', 'matematicas'],
    collectionId: 'rotoplas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1, repetitionCount: 0, easeFactor: 2.5, nextReviewDate: new Date().toISOString(), status: 'new',
  },
];
