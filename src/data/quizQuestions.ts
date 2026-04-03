import type { QuizQuestion } from '@/types';

type Difficulty = QuizQuestion['difficulty'];

interface McqInput {
  collectionId: string;
  conceptName: string;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

interface TfInput {
  collectionId: string;
  conceptName: string;
  difficulty: Difficulty;
  question: string;
  isTrue: boolean;
  explanation: string;
}

interface FillInput {
  collectionId: string;
  conceptName: string;
  difficulty: Difficulty;
  question: string;
  blankSentence: string;
  blankWord: string;
  blankOptions: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

interface FlashInput {
  collectionId: string;
  conceptName: string;
  difficulty: Difficulty;
  question: string;
  answer: string;
  explanation: string;
}

function mcq(input: McqInput): QuizQuestion {
  return {
    collectionId: input.collectionId,
    conceptName: input.conceptName,
    type: 'multiple-choice',
    difficulty: input.difficulty,
    question: input.question,
    answer: input.options[input.correctIndex],
    explanation: input.explanation,
    options: input.options,
    correctIndex: input.correctIndex,
  };
}

function tf(input: TfInput): QuizQuestion {
  return {
    collectionId: input.collectionId,
    conceptName: input.conceptName,
    type: 'true-false',
    difficulty: input.difficulty,
    question: input.question,
    answer: input.isTrue ? 'Verdadero' : 'Falso',
    explanation: input.explanation,
    isTrue: input.isTrue,
  };
}

function fill(input: FillInput): QuizQuestion {
  return {
    collectionId: input.collectionId,
    conceptName: input.conceptName,
    type: 'fill-blank',
    difficulty: input.difficulty,
    question: input.question,
    answer: input.blankOptions[input.correctIndex],
    explanation: input.explanation,
    blankSentence: input.blankSentence,
    blankWord: input.blankWord,
    blankOptions: input.blankOptions,
    correctIndex: input.correctIndex,
  };
}

function flash(input: FlashInput): QuizQuestion {
  return {
    collectionId: input.collectionId,
    conceptName: input.conceptName,
    type: 'flashcard',
    difficulty: input.difficulty,
    question: input.question,
    answer: input.answer,
    explanation: input.explanation,
  };
}

function shuffleArray<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const CURATED_QUESTIONS: QuizQuestion[] = [
  // FACIL
  fill({
    collectionId: 'consciencia',
    conceptName: 'Qualia',
    difficulty: 'facil',
    question: 'Completa la idea',
    blankSentence: 'La experiencia subjetiva de sentir un color o dolor se llama _____.',
    blankWord: 'qualia',
    blankOptions: ['sinapsis', 'qualia', 'algoritmo', 'sesgo'],
    correctIndex: 1,
    explanation: 'Qualia nombra el lado subjetivo de la experiencia.',
  }),
  tf({
    collectionId: 'consciencia',
    conceptName: 'Hard Problem',
    difficulty: 'facil',
    question: 'Mapear neuronas explica por si solo por que existe experiencia subjetiva.',
    isTrue: false,
    explanation: 'Ese hueco explicativo es justo el hard problem.',
  }),
  mcq({
    collectionId: 'software',
    conceptName: 'HTTP 401 vs 403',
    difficulty: 'facil',
    question: 'Que diferencia correcta hay entre 401 y 403?',
    options: [
      '401 es recurso no encontrado, 403 es timeout',
      '401 y 403 son equivalentes',
      '401 no autenticado, 403 sin permiso',
      '401 error de frontend, 403 error de backend',
    ],
    correctIndex: 2,
    explanation: '401 pide credenciales; 403 niega acceso aun con identidad.',
  }),
  fill({
    collectionId: 'software',
    conceptName: 'CRUD',
    difficulty: 'facil',
    question: 'Completa la secuencia basica',
    blankSentence: 'CRUD significa Create, Read, Update y _____.',
    blankWord: 'Delete',
    blankOptions: ['Delete', 'Merge', 'Cache', 'Compile'],
    correctIndex: 0,
    explanation: 'CRUD describe operaciones basicas sobre datos.',
  }),
  tf({
    collectionId: 'patrones',
    conceptName: 'Feedback',
    difficulty: 'facil',
    question: 'Feedback negativo en sistemas siempre significa algo malo.',
    isTrue: false,
    explanation: 'Negativo puede estabilizar, como un termostato.',
  }),
  mcq({
    collectionId: 'patrones',
    conceptName: 'Pareto',
    difficulty: 'facil',
    question: 'Que expresa mejor la regla 80/20?',
    options: [
      'Todas las causas pesan igual',
      'Pocos factores explican gran parte del efecto',
      'Solo aplica a ventas',
      'Es una ley exacta en todo contexto',
    ],
    correctIndex: 1,
    explanation: 'No es exacta, pero describe concentracion de impacto.',
  }),
  fill({
    collectionId: 'automatizacion',
    conceptName: 'Idempotencia',
    difficulty: 'facil',
    question: 'Completa la definicion',
    blankSentence: 'Una operacion es _____ si repetirla no cambia el resultado final.',
    blankWord: 'idempotente',
    blankOptions: ['asincrona', 'idempotente', 'eventual', 'mutable'],
    correctIndex: 1,
    explanation: 'Clave para reintentos seguros en jobs y APIs.',
  }),
  tf({
    collectionId: 'automatizacion',
    conceptName: 'Retries',
    difficulty: 'facil',
    question: 'Si un servicio falla, reintentar sin limite siempre es buena practica.',
    isTrue: false,
    explanation: 'Sin control puedes saturar sistemas; usa backoff y limites.',
  }),
  mcq({
    collectionId: 'qa-pro',
    conceptName: 'Flaky tests',
    difficulty: 'facil',
    question: 'Por que un test flaky es peligroso?',
    options: [
      'Porque tarda mas en compilar',
      'Porque impide usar TypeScript',
      'Porque hace que el equipo ignore fallas reales',
      'Porque obliga a usar Selenium',
    ],
    correctIndex: 2,
    explanation: 'Si todo parece ruido, un bug real se pierde.',
  }),
  fill({
    collectionId: 'qa-pro',
    conceptName: 'Shift Left',
    difficulty: 'facil',
    question: 'Completa la idea',
    blankSentence: 'Shift left significa probar _____ en el ciclo, no al final.',
    blankWord: 'antes',
    blankOptions: ['mas caro', 'automaticamente', 'antes', 'despues'],
    correctIndex: 2,
    explanation: 'Detectar temprano reduce costo y retrabajo.',
  }),
  tf({
    collectionId: 'geopolitica',
    conceptName: 'Narrativa',
    difficulty: 'facil',
    question: 'Controlar narrativa no afecta decisiones politicas reales.',
    isTrue: false,
    explanation: 'Narrativa moldea percepcion de riesgo, legitimidad y accion.',
  }),
  mcq({
    collectionId: 'geopolitica',
    conceptName: 'Incentivos',
    difficulty: 'facil',
    question: 'Que explica mejor decisiones de actores estatales?',
    options: [
      'Solo ideologia declarada',
      'Incentivos, restricciones y costos',
      'Solo personalidad del lider',
      'Suerte historica',
    ],
    correctIndex: 1,
    explanation: 'Analizar incentivos da mejor prediccion que slogans.',
  }),
  fill({
    collectionId: 'hermetismo',
    conceptName: 'Simbolo',
    difficulty: 'facil',
    question: 'Completa la idea',
    blankSentence: 'En tradiciones simbolicas, el simbolo no solo representa: tambien _____.',
    blankWord: 'organiza percepcion',
    blankOptions: ['decora texto', 'organiza percepcion', 'reemplaza metodo', 'elimina contexto'],
    correctIndex: 1,
    explanation: 'Un simbolo dirige atencion y lectura de la experiencia.',
  }),
  tf({
    collectionId: 'hermetismo',
    conceptName: 'Practica',
    difficulty: 'facil',
    question: 'Sin practica, solo leer sistemas simbolicos suele producir comprension estable.',
    isTrue: false,
    explanation: 'Sin iteracion practica, la comprension se vuelve abstracta y fragil.',
  }),
  flash({
    collectionId: 'rotoplas',
    conceptName: 'Priorizacion',
    difficulty: 'facil',
    question: 'Describe una regla simple para priorizar trabajo diario sin saturarte.',
    answer: 'Usa 3 niveles: critico hoy, importante semana, puede esperar. Elige maximo 1 tarea critica y 2 importantes por bloque.',
    explanation: 'Limitar WIP reduce ruido y mejora ejecucion.',
  }),

  // MEDIO
  mcq({
    collectionId: 'consciencia',
    conceptName: 'Panpsiquismo',
    difficulty: 'medio',
    question: 'Que afirma una lectura fuerte de panpsiquismo?',
    options: [
      'Toda entidad piensa como humano',
      'La experiencia no emerge de cero en complejidad alta',
      'La consciencia es ilusion linguistica',
      'La materia no existe',
    ],
    correctIndex: 1,
    explanation: 'No antropomorfiza todo; propone experiencia como rasgo basal.',
  }),
  flash({
    collectionId: 'consciencia',
    conceptName: 'Conatus',
    difficulty: 'medio',
    question: 'Conatus en clave practica: como se reconoce en una semana real?',
    answer: 'Cuando una decision te deja con mas capacidad de actuar despues, expandes conatus. Si te deja drenado sin direccion, lo contraes.',
    explanation: 'Es un criterio operativo de energia y agencia.',
  }),
  mcq({
    collectionId: 'software',
    conceptName: 'Event Loop',
    difficulty: 'medio',
    question: 'Que es correcto sobre setTimeout(fn, 0)?',
    options: [
      'Ejecuta antes del codigo sync pendiente',
      'Ejecuta solo despues de vaciar call stack',
      'Bloquea el hilo principal',
      'Siempre corre en microtask queue',
    ],
    correctIndex: 1,
    explanation: 'Se encola y espera a que el stack actual termine.',
  }),
  tf({
    collectionId: 'software',
    conceptName: 'fetch',
    difficulty: 'medio',
    question: 'fetch lanza excepcion automaticamente en cualquier HTTP 4xx/5xx.',
    isTrue: false,
    explanation: 'Solo falla por red; 4xx/5xx requieren revisar response.ok.',
  }),
  fill({
    collectionId: 'software',
    conceptName: 'Closure',
    difficulty: 'medio',
    question: 'Completa',
    blankSentence: 'Una funcion interna que conserva acceso al scope externo forma un _____.',
    blankWord: 'closure',
    blankOptions: ['closure', 'decorator', 'mutex', 'bundle'],
    correctIndex: 0,
    explanation: 'Base de muchos patrones en JS y React.',
  }),
  mcq({
    collectionId: 'patrones',
    conceptName: 'Segundo orden',
    difficulty: 'medio',
    question: 'Pensar en segundo orden significa:',
    options: [
      'Optimizar solo efecto inmediato',
      'Evitar decisiones reversibles',
      'Evaluar consecuencias de consecuencias',
      'Usar solo datos historicos',
    ],
    correctIndex: 2,
    explanation: 'Evita soluciones que se rompen al escalar.',
  }),
  flash({
    collectionId: 'patrones',
    conceptName: 'Antifragil',
    difficulty: 'medio',
    question: 'Diferencia rapida entre robusto y antifragil.',
    answer: 'Robusto resiste shock y queda igual. Antifragil usa shock para mejorar.',
    explanation: 'No es solo aguantar: es aprender y subir rendimiento.',
  }),
  mcq({
    collectionId: 'automatizacion',
    conceptName: 'Backoff',
    difficulty: 'medio',
    question: 'Por que usar backoff exponencial en reintentos?',
    options: [
      'Para ocultar errores',
      'Para reducir costo de logs',
      'Para dar tiempo de recuperacion y evitar tormenta de retries',
      'Para garantizar exito en primer reintento',
    ],
    correctIndex: 2,
    explanation: 'Backoff protege al sistema cuando esta degradado.',
  }),
  tf({
    collectionId: 'automatizacion',
    conceptName: 'Human in the loop',
    difficulty: 'medio',
    question: 'Todo flujo con IA debe ser completamente autonomo para ser util.',
    isTrue: false,
    explanation: 'En tareas de riesgo, aprobacion humana aumenta seguridad.',
  }),
  fill({
    collectionId: 'qa-pro',
    conceptName: 'Test Pyramid',
    difficulty: 'medio',
    question: 'Completa',
    blankSentence: 'La piramide de testing recomienda muchos tests _____ y menos E2E.',
    blankWord: 'unitarios',
    blankOptions: ['manuales', 'unitarios', 'visuales', 'exploratorios'],
    correctIndex: 1,
    explanation: 'Unitarios son mas rapidos y baratos de mantener.',
  }),
  mcq({
    collectionId: 'qa-pro',
    conceptName: 'Contract testing',
    difficulty: 'medio',
    question: 'Que valida un contract test entre servicios?',
    options: [
      'UI final pixel-perfect',
      'Acuerdo de request/response entre consumidor y proveedor',
      'Solo performance del endpoint',
      'Solo autenticacion OAuth',
    ],
    correctIndex: 1,
    explanation: 'Protege integracion sin depender de entornos inestables.',
  }),
  flash({
    collectionId: 'geopolitica',
    conceptName: 'Sanciones',
    difficulty: 'medio',
    question: 'Por que sanciones a veces no logran el cambio politico esperado?',
    answer: 'Pueden fortalecer narrativas internas, crear rutas alternativas y redistribuir costos hacia poblacion en vez de elite decisora.',
    explanation: 'Impacto economico no siempre implica impacto estrategico.',
  }),
  mcq({
    collectionId: 'geopolitica',
    conceptName: 'Principal-Agent',
    difficulty: 'medio',
    question: 'En politica publica, un problema principal-agent aparece cuando:',
    options: [
      'No existen indicadores',
      'El ejecutor tiene incentivos distintos al mandante',
      'Hay exceso de transparencia',
      'El presupuesto es alto',
    ],
    correctIndex: 1,
    explanation: 'La implementacion puede desviarse aunque el objetivo oficial sea claro.',
  }),
  tf({
    collectionId: 'hermetismo',
    conceptName: 'Mapa y territorio',
    difficulty: 'medio',
    question: 'Confundir simbolo con realidad literal suele mejorar una practica.',
    isTrue: false,
    explanation: 'Mapa util no reemplaza verificacion en experiencia real.',
  }),
  fill({
    collectionId: 'rotoplas',
    conceptName: 'Bloques de energia',
    difficulty: 'medio',
    question: 'Completa',
    blankSentence: 'Para sostener ejecucion, divide trabajo en bloques de _____ y recuperacion.',
    blankWord: 'foco',
    blankOptions: ['foco', 'urgencia', 'interrupciones', 'reunion'],
    correctIndex: 0,
    explanation: 'Alternar foco y pausa ayuda a evitar colapso de atencion.',
  }),

  // DIFICIL
  flash({
    collectionId: 'consciencia',
    conceptName: 'Zombie filosofico',
    difficulty: 'dificil',
    question: 'Si un zombie filosofico es concebible, que tension deja para el fisicalismo estricto?',
    answer: 'Que equivalencia funcional no prueba equivalencia fenomenica: conducta igual no garantiza experiencia subjetiva.',
    explanation: 'Abre el hueco entre explicacion causal y fenomenologia.',
  }),
  mcq({
    collectionId: 'consciencia',
    conceptName: 'Determinismo y libertad',
    difficulty: 'dificil',
    question: 'En una lectura spinozista, cual es una forma robusta de libertad?',
    options: [
      'Actuar sin causa',
      'Elegir al azar para evitar sesgos',
      'Comprender causas propias y actuar con ese conocimiento',
      'Negar condicionamientos biologicos',
    ],
    correctIndex: 2,
    explanation: 'No es ausencia de causalidad, sino agencia informada dentro de ella.',
  }),
  tf({
    collectionId: 'software',
    conceptName: 'N+1',
    difficulty: 'dificil',
    question: 'El problema N+1 casi nunca escala porque cada query individual es pequena.',
    isTrue: false,
    explanation: 'El costo total se dispara por multiplicacion de round-trips.',
  }),
  flash({
    collectionId: 'software',
    conceptName: 'Arquitectura',
    difficulty: 'dificil',
    question: 'Cuando NO conviene pasar de monolito modular a microservicios?',
    answer: 'Cuando el cuello de botella no esta probado, el dominio cambia rapido y el equipo aun no domina observabilidad, operaciones distribuidas y contratos.',
    explanation: 'Sin necesidad real, introduces complejidad prematura.',
  }),
  mcq({
    collectionId: 'software',
    conceptName: 'Consistencia',
    difficulty: 'dificil',
    question: 'Si priorizas disponibilidad en red inestable, que tradeoff aceptas?',
    options: [
      'Latencia cero siempre',
      'Consistencia fuerte inmediata en todos los nodos',
      'Consistencia eventual en algunas lecturas',
      'Eliminacion de retries',
    ],
    correctIndex: 2,
    explanation: 'CAP obliga decisiones; no se maximizan todas las propiedades a la vez.',
  }),
  tf({
    collectionId: 'patrones',
    conceptName: 'Sistemas complejos',
    difficulty: 'dificil',
    question: 'Optimizar localmente cada subsistema garantiza optimo global.',
    isTrue: false,
    explanation: 'Interacciones no lineales pueden empeorar el sistema total.',
  }),
  flash({
    collectionId: 'patrones',
    conceptName: 'Leverage',
    difficulty: 'dificil',
    question: 'Que tipo de intervencion suele tener mayor leverage en sistemas humanos?',
    answer: 'Cambiar reglas, incentivos o bucles de feedback; no solo empujar mas esfuerzo en el mismo punto.',
    explanation: 'El leverage vive en estructura, no en volumen de accion.',
  }),
  mcq({
    collectionId: 'automatizacion',
    conceptName: 'Agentes',
    difficulty: 'dificil',
    question: 'En un agente autonomo, cual guardrail reduce mas riesgo operacional?',
    options: [
      'Mas temperatura del modelo',
      'Timeouts, limites de costo y pasos aprobables',
      'Prompts mas largos sin limites',
      'Ejecutar siempre con permisos maximos',
    ],
    correctIndex: 1,
    explanation: 'Control de alcance evita loops costosos y acciones peligrosas.',
  }),
  fill({
    collectionId: 'automatizacion',
    conceptName: 'Observabilidad',
    difficulty: 'dificil',
    question: 'Completa',
    blankSentence: 'Sin logs estructurados, metricas y trazas, depurar automatizacion en produccion es casi _____.',
    blankWord: 'ciego',
    blankOptions: ['rapido', 'barato', 'ciego', 'determinista'],
    correctIndex: 2,
    explanation: 'Observabilidad convierte caos en diagnostico accionable.',
  }),
  flash({
    collectionId: 'qa-pro',
    conceptName: 'Oraculo de test',
    difficulty: 'dificil',
    question: 'Que es un oraculo de test y por que es el punto mas subestimado?',
    answer: 'Es la regla que decide si el resultado es correcto. Sin un oraculo confiable, automatizas ruido y no calidad.',
    explanation: 'Muchos equipos automatizan pasos, pero no validaciones con valor.',
  }),
  mcq({
    collectionId: 'qa-pro',
    conceptName: 'Cobertura',
    difficulty: 'dificil',
    question: 'Alta cobertura de lineas no garantiza calidad porque:',
    options: [
      'La cobertura mide ejecucion, no calidad de aserciones',
      'Cobertura solo aplica a backend',
      'Cobertura impide refactor',
      'Cobertura reemplaza pruebas exploratorias',
    ],
    correctIndex: 0,
    explanation: 'Puedes ejecutar mucho codigo y aun no detectar fallas importantes.',
  }),
  tf({
    collectionId: 'geopolitica',
    conceptName: 'Disuasiones',
    difficulty: 'dificil',
    question: 'La disuasion funciona solo con capacidad militar; credibilidad no importa.',
    isTrue: false,
    explanation: 'Sin credibilidad y señales consistentes, capacidad no basta.',
  }),
  flash({
    collectionId: 'geopolitica',
    conceptName: 'Dependencias',
    difficulty: 'dificil',
    question: 'Como puede una dependencia economica ser a la vez ventaja y vulnerabilidad?',
    answer: 'Da escala y eficiencia, pero crea puntos de presion estrategica si un nodo critico se interrumpe.',
    explanation: 'Resiliencia requiere redundancia selectiva, no aislamiento total.',
  }),
  tf({
    collectionId: 'hermetismo',
    conceptName: 'Practica simbolica',
    difficulty: 'dificil',
    question: 'Una practica simbolica robusta debe ignorar contexto historico y psicologico.',
    isTrue: false,
    explanation: 'Sin contexto, la practica pierde calibracion y criterio.',
  }),
  flash({
    collectionId: 'rotoplas',
    conceptName: 'Ejecucion sostenida',
    difficulty: 'dificil',
    question: 'Disena una regla de operacion para dias de baja energia sin perder traccion.',
    answer: 'Define version minima del dia: 1 tarea troncal, 1 tarea de mantenimiento, 1 cierre rapido. Si se cumple, el dia cuenta.',
    explanation: 'Sostener consistencia supera picos aislados de productividad.',
  }),
];

export function getCuratedByCollection(collectionId: string): QuizQuestion[] {
  return CURATED_QUESTIONS.filter((question) => question.collectionId === collectionId);
}

export function getCuratedByDifficulty(difficulty: QuizQuestion['difficulty']): QuizQuestion[] {
  return CURATED_QUESTIONS.filter((question) => question.difficulty === difficulty);
}

export function getCuratedFiltered(
  collectionId: string | null,
  difficulty: QuizQuestion['difficulty'],
  count: number
): QuizQuestion[] {
  const primary = CURATED_QUESTIONS.filter(
    (question) =>
      question.difficulty === difficulty &&
      (collectionId ? question.collectionId === collectionId : true)
  );
  if (primary.length >= count) return shuffleArray(primary).slice(0, count);

  const used = new Set(primary.map((question) => `${question.collectionId}-${question.question}`));
  const secondary = CURATED_QUESTIONS.filter(
    (question) =>
      !used.has(`${question.collectionId}-${question.question}`) &&
      (collectionId ? question.collectionId === collectionId : true)
  );
  const tertiary = CURATED_QUESTIONS.filter(
    (question) => !used.has(`${question.collectionId}-${question.question}`)
  );

  return shuffleArray([...primary, ...secondary, ...tertiary]).slice(0, count);
}
