import type { Drop, Collection } from '@/types';

export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'qa-testing',
    name: 'QA Testing',
    description: 'Testing manual y automatizado',
    color: '#7c3aed',
    dropCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sql-apis',
    name: 'SQL & APIs',
    description: 'Bases de datos y APIs',
    color: '#2563eb',
    dropCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'filosofia',
    name: 'Filosofía',
    description: 'Spinoza, Deleuze, Guattari',
    color: '#dc2626',
    dropCount: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dev-jr',
    name: 'Dev JR',
    description: 'Desarrollo web junior',
    color: '#16a34a',
    dropCount: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Análisis de datos',
    color: '#ea580c',
    dropCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'faggin',
    name: 'Federico Faggin',
    description: 'Ideas sobre consciencia y tecnología',
    color: '#0891b2',
    dropCount: 4,
    createdAt: new Date().toISOString(),
  },
];

export const SAMPLE_DROPS: Drop[] = [
  // QA Testing
  {
    id: '1',
    title: 'Pirámide de Testing',
    content: 'Unit tests (base) → Integration tests → E2E tests (cima). Más arriba en la pirámide = más lento y costoso. 70% unit, 20% integration, 10% E2E.',
    type: 'definition',
    tags: ['qa', 'testing', 'automation'],
    collectionId: 'qa-testing',
    visualContent: `        /\\
       /E2E\\
      /──────\\
     /Integration\\
    /──────────────\\
   /   Unit Tests    \\
  /────────────────────\\`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '2',
    title: 'Testing es como ser detective',
    content: 'Un buen QA no solo encuentra bugs, entiende el sistema lo suficiente para predecir dónde podrían fallar. Como Sherlock: observa patrones, hace preguntas incómodas, nunca asume.',
    type: 'analogy',
    tags: ['qa', 'mindset'],
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
    id: '3',
    title: '¿Por qué el testing manual nunca morirá?',
    content: 'La automatización prueba lo que ESPERAS que pase. El testing manual encuentra lo que NO ESPERAS. El factor humano = exploración, curiosidad, sentido común.',
    type: 'hook',
    tags: ['qa', 'manual-testing'],
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
    id: '4',
    title: 'El 80% de los bugs vienen del 20% del código',
    content: 'Ley de Pareto aplicada a software. Identifica esos módulos problemáticos y dales testing exhaustivo. No distribuyas esfuerzos uniformemente.',
    type: 'trivia',
    tags: ['qa', 'principios'],
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
    id: '5',
    title: 'Assert vs Verify',
    content: 'Assert detiene el test al fallar (hard stop). Verify continúa y reporta errores al final. Usa Assert para precondiciones críticas, Verify para verificaciones múltiples.',
    type: 'definition',
    tags: ['qa', 'automation', 'selenium'],
    collectionId: 'qa-testing',
    codeSnippet: `// Assert - detiene inmediatamente
Assert.assertEquals(expected, actual);

// Verify - continúa ejecutando
VerificationErrors.verifyEquals(expected, actual);`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
  {
    id: '6',
    title: 'Page Object Model',
    content: 'Patrón que separa la lógica de localización de elementos (selectores) de los tests. Si cambia la UI, cambias el Page Object, no 50 tests.',
    type: 'definition',
    tags: ['qa', 'automation', 'patterns'],
    collectionId: 'qa-testing',
    codeSnippet: `class LoginPage {
  private usernameInput = '#username';
  private passwordInput = '#password';
  private submitButton = '#submit';
  
  login(user: string, pass: string) {
    cy.get(this.usernameInput).type(user);
    cy.get(this.passwordInput).type(pass);
    cy.get(this.submitButton).click();
  }
}`,
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
    title: 'JOINs visuales',
    content: 'INNER JOIN = intersección. LEFT JOIN = todo A + intersección. RIGHT JOIN = todo B + intersección. FULL OUTER = unión completa.',
    type: 'analogy',
    tags: ['sql', 'databases'],
    collectionId: 'sql-apis',
    visualContent: `INNER    LEFT     RIGHT    FULL
┌───┐    ┌───┐    ┌───┐    ┌───┐
│ A │    │███│    │ █ │    │███│
│─█─│    │─█─│    │─█─│    │─█─│
│ B │    │   │    │███│    │███│
└───┘    └───┘    └───┘    └───┘`,
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
    title: 'REST vs SOAP',
    content: 'REST = arquitectura, HTTP + JSON, stateless, flexible. SOAP = protocolo, XML estricto, WS-* standards, enterprise. REST ganó por simplicidad.',
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
    title: 'Códigos HTTP que todo dev debe saber',
    content: '200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.',
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
    title: 'N+1 Query Problem',
    content: 'Cargas una lista (1 query), luego para cada item haces otra query. 100 items = 101 queries. Solución: JOIN o eager loading.',
    type: 'definition',
    tags: ['sql', 'performance', 'backend'],
    collectionId: 'sql-apis',
    codeSnippet: `// MAL - N+1
const users = await db.users.findAll();
for (const user of users) {
  user.orders = await db.orders.find({ userId: user.id }); // N queries
}

// BIEN - 1 query con JOIN
const users = await db.users.findAll({
  include: [{ model: db.orders }]
});`,
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
    title: 'Spinoza: Deus sive Natura',
    content: 'Dios o la Naturaleza. No son dos cosas separadas. Dios no es un ser fuera del mundo, ES el mundo. Panteísmo riguroso: todo lo que existe es modos de un único sustancia infinita.',
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
    title: 'Afectos según Spinoza',
    content: 'No son "emociones" pasivas. Son modificaciones del cuerpo que aumentan o disminuyen su potencia de actuar. Alegría = aumento de perfección. Tristeza = disminución.',
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
    title: 'Deleuze & Guattari: Rizoma',
    content: 'El pensamiento occidental es arborescente (jerárquico, raíz-tronco-ramas). El rizoma es red: cualquier punto puede conectarse con cualquier otro, sin centro, sin jerarquía. Internet es rizoma.',
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
    title: 'Líneas de fuga',
    content: 'Todo sistema (social, político, psicológico) tiene líneas de fuga: escapatorias, grietas donde algo nuevo puede emerger. Revolución no es ruptura, es acelerar una línea de fuga existente.',
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
    title: 'Git es un grafo de snapshots',
    content: 'No guarda diferencias, guarda el estado completo del repo en cada commit. Cada commit apunta a su padre(s). Las ramas son solo punteros móviles a commits.',
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
    title: 'DRY vs WET',
    content: 'DRY: Don\'t Repeat Yourself. WET: Write Everything Twice (o We Enjoy Typing). Regla práctica: si lo usas 3+ veces, abstráelo. 2 veces, espera. Prematura abstracción = deuda técnica.',
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
    title: 'Callback Hell → Promises → Async/Await',
    content: 'Evolución de async en JS: pirámide de la muerte, then() encadenados, async/await (syntactic sugar). Mismo resultado, legibilidad exponencialmente mejor.',
    type: 'connection',
    tags: ['javascript', 'async', 'evolution'],
    collectionId: 'dev-jr',
    codeSnippet: `// Callback Hell
readFile('a.txt', (err, data) => {
  readFile('b.txt', (err, data) => {
    readFile('c.txt', (err, data) => {
      // ...
    });
  });
});

// Async/Await
const a = await readFile('a.txt');
const b = await readFile('b.txt');
const c = await readFile('c.txt');`,
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
    title: 'La terminal es tu IDE',
    content: 'Los devs senior viven en la terminal no por nostalgia, por velocidad. Cada segundo que no sacas las manos del teclado es productividad. Inversión: 1 semana de curva de aprendizaje, retorno: décadas.',
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

  // Data Analyst
  {
    id: '19',
    title: 'Mean vs Median',
    content: 'Media (mean): suma/n, sensible a outliers. Mediana: valor central, robusta. En ingresos: la media dice "todos somos ricos", la mediana dice la verdad. Siempre grafica la distribución.',
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
    title: 'Correlation ≠ Causation',
    content: 'Ice cream sales correlan con ahogamientos. ¿El helado causa ahogamientos? No, el verano causa ambos. Siempre pregunta: ¿hay un tercer factor? ¿dirección de causalidad?',
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
    title: 'El microprocesador como metáfora',
    content: 'Faggin diseñó el Intel 4004, pero su visión va más allá: la tecnología es extensión de la mente humana. El chip no reemplaza, amplifica. Como la escritura, como la imprenta.',
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
    title: 'Consciencia vs Inteligencia',
    content: 'Faggin distingue: la IA es procesamiento de información. La consciencia es experiencia subjetiva (qualia). Un sistema puede ser inteligente sin ser consciente. ¿Puede ser consciente sin ser biológico?',
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
    title: 'El problema de la intencionalidad',
    content: 'Las máquinas procesan símbolos sin significado (sintaxis sin semántica). Los humanos tenemos intencionalidad: nuestros pensamientos SON sobre algo. ¿Puede una máquina tener intencionalidad genuina?',
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

  // Más contenido variado
  {
    id: '24',
    title: 'Closure',
    content: 'Función que "recuerda" el scope donde fue creada, incluso después de que ese scope ya no exista.',
    type: 'definition',
    tags: ['javascript', 'programming'],
    codeSnippet: `function crearContador() {
  let count = 0;
  return () => ++count; // "recuerda" count
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
    id: '25',
    title: 'El cerebro es como un bosque',
    content: 'Cada pensamiento es un camino. Los que usas más se vuelven senderos claros. Los que abandonas desaparecen bajo la maleza. Neuroplasticidad = jardinería mental.',
    type: 'analogy',
    tags: ['neuroscience', 'learning', 'productivity'],
    visualContent: `    🌲   🌲       🌲
  🌲───────🌲   🌲
    │   │   ╱ ╲
  🌲─│───│─🌲   🌲
    │   │    
  sendero  maleza`,
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
    title: '¿Por qué el cielo es azul pero rojo al atardecer?',
    content: 'Misma luz del sol, diferente ángulo... ¿qué cambia?',
    type: 'hook',
    tags: ['physics', 'curiosity'],
    visualContent: `☀️ ───────→ 🌍

Distancia extra = más dispersión = colores diferentes`,
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
    title: 'Tu cuerpo reemplaza el 98% de sus átomos cada año',
    content: 'Eres literalmente una persona diferente cada 12 meses. Lo que eres "tú" no es la materia, es el patrón.',
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
    content: 'Las fugas de Bach repiten patrones a diferentes escalas, igual que los fractales. Mismo principio: auto-similitud a cualquier nivel de zoom.',
    type: 'connection',
    tags: ['music', 'math', 'patterns'],
    visualContent: `    ∞ ◇ ◇ ◇ ◇ ∞
      ◇ ◇ ◇ ◇
    ∞ ◇ ◇ ◇ ◇ ∞`,
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
    title: 'La procrastinación no es pereza',
    content: 'Es regulación emocional. Evitas la tarea porque evitas la emoción negativa asociada. Curar procrastinación = cambiar cómo te sientes sobre la tarea, no forzarte a hacerla.',
    type: 'insight',
    tags: ['psychology', 'productivity'],
    visualContent: `😰 ──avoid──> 🚫 tarea
      │
      │ reframe
      ▼
😊 ──approach──> ✅ tarea`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
  },
];
