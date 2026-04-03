import type { QuizQuestion, Difficulty } from '@/types';
import { normalizeTags } from '@/lib/dropContent';
export type { QuizQuestion };

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GeneratedDrop {
  title: string;
  content: string;
  type: 'definition' | 'ruptura' | 'puente' | 'operativo' | 'code';
  tags: string[];
  codeSnippet?: string;
}

export async function generateDropsFromTopic(
  topic: string,
  collectionHint: string
): Promise<GeneratedDrop[]> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackDrops(topic);
  }

  const systemPrompt = `Eres un generador de "drops" de conocimiento para una app de aprendizaje con repetición espaciada.
Un drop es una unidad de conocimiento breve, densa y cognitivamente distinta — estilo Twitter pero con profundidad.

Los 5 tipos de drops y cuándo usarlos:
- "definition": ancla un concepto técnico con precisión. Define términos, explica mecanismos, establece qué ES algo. Denso, sin relleno.
- "ruptura": derrumba una intuición común o revela que algo funciona al revés de lo esperado. Genera tensión cognitiva. Empieza con la contradicción.
- "puente": conecta dos dominios que no parecen relacionados. Hace visible una estructura compartida. El valor está en la conexión, no en cada parte.
- "operativo": protocolo aplicable. Checklist, método, serie de pasos concretos. Termina en acción, no en comprensión abstracta.
- "code": el núcleo del concepto ES código. Incluye snippet ejecutable en el campo codeSnippet.

REGLA PRINCIPAL: Si el tema puede ser cubierto naturalmente por más de un tipo, genera un drop por cada tipo relevante. No fuerces tipos que no apliquen — pero si aplican, úsalos.

ESTILO del contenido:
- Directo, sin intro, sin "En resumen..." ni "Es importante recordar que..."
- Entre 2 y 5 oraciones de alta densidad informativa
- Frases cortas, concretas y fáciles de escanear (pensado para atención AuDHD)
- Evita tono grandilocuente y afirmaciones absolutas no verificables
- El título es el concepto central, no una descripción
- Tags: 3-5 términos en minúsculas, sin espacios, separados, relevantes para búsqueda
- El PRIMER tag debe ser una subcategoría corta y estable (ej: filosofia-mente, neurociencia, frontend, testing, agentes)
- Para type "code": el codeSnippet es código real y ejecutable, el content explica qué hace y por qué importa

Responde ÚNICAMENTE con JSON válido — un array de drops:
[
  {
    "title": "string",
    "content": "string",
    "type": "definition" | "ruptura" | "puente" | "operativo" | "code",
    "tags": ["string"],
    "codeSnippet": "string o null"
  }
]

Sin texto antes ni después del JSON.`;

  const userPrompt = `Tema: "${topic}"
Colección destino: "${collectionHint}"

Genera los drops que consideres necesarios para cubrir este tema con profundidad. Si el tema justifica múltiples perspectivas (definición + ruptura, o definición + código, etc.), genera uno por cada tipo relevante.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error('Groq API error');

    const data: GroqResponse = await response.json();
    const raw = data.choices[0]?.message?.content || '';

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: GeneratedDrop[];
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return generateFallbackDrops(topic);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) return generateFallbackDrops(topic);

    const VALID_TYPES = ['definition', 'ruptura', 'puente', 'operativo', 'code'];

    return parsed
      .filter(
        (d) =>
          typeof d.title === 'string' &&
          typeof d.content === 'string' &&
          VALID_TYPES.includes(d.type) &&
          Array.isArray(d.tags)
      )
      .map((d) => {
        const title = d.title.slice(0, 200);
        const content = d.content.slice(0, 5000);
        const type = d.type;
        const tags = normalizeTags({
          tags: d.tags.slice(0, 10).map((t: string) => String(t).slice(0, 30)),
          type,
          title,
          content,
          collectionId: undefined,
        });
        return {
          title,
          content,
          type,
          tags,
          codeSnippet: d.codeSnippet ? String(d.codeSnippet) : undefined,
        };
      });
  } catch {
    return generateFallbackDrops(topic);
  }
}

export async function structureRawThought(rawText: string): Promise<GeneratedDrop> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return structureRawFallback(rawText);
  }

  const systemPrompt = `Conviertes pensamientos crudos en drops de conocimiento para una app de aprendizaje con repetición espaciada.

Un drop tiene 5 tipos:
- "definition": ancla un concepto con precisión
- "ruptura": derrumba una intuición común, revela algo inesperado
- "puente": conecta dos dominios distintos
- "operativo": protocolo o pasos concretos
- "code": el núcleo es código (incluye codeSnippet)

Tu trabajo:
1. Detectar el tipo más adecuado para el pensamiento
2. Generar un título conciso y preciso (máx 100 chars)
3. Expandir el contenido: 2-5 oraciones densas, sin relleno. Enriquece sin inventar.
4. Extraer 3-5 tags relevantes en minúsculas
5. El primer tag debe representar una subcategoría estable y reutilizable

Responde ÚNICAMENTE con JSON válido:
{"title":"string","content":"string","type":"definition|ruptura|puente|operativo|code","tags":["string"],"codeSnippet":null}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Estructura este pensamiento en un drop:\n\n"${rawText}"` },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error('Groq API error');

    const data: GroqResponse = await response.json();
    const raw = data.choices[0]?.message?.content || '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed = JSON.parse(cleaned);
    const VALID_TYPES = ['definition', 'ruptura', 'puente', 'operativo', 'code'];

    if (
      typeof parsed.title !== 'string' ||
      typeof parsed.content !== 'string' ||
      !VALID_TYPES.includes(parsed.type) ||
      !Array.isArray(parsed.tags)
    ) {
      return structureRawFallback(rawText);
    }

    const title = parsed.title.slice(0, 200);
    const content = parsed.content.slice(0, 5000);
    const type = parsed.type as GeneratedDrop['type'];
    const tags = normalizeTags({
      tags: parsed.tags.slice(0, 10).map((t: string) => String(t).slice(0, 30)),
      type,
      title,
      content,
      collectionId: undefined,
    });
    return {
      title,
      content,
      type,
      tags,
      codeSnippet: parsed.codeSnippet ? String(parsed.codeSnippet) : undefined,
    };
  } catch {
    return structureRawFallback(rawText);
  }
}

function structureRawFallback(rawText: string): GeneratedDrop {
  const lines = rawText.trim().split('\n');
  const title = lines[0].trim().slice(0, 100);
  const content = lines.length > 1 ? lines.slice(1).join('\n').trim() || title : title;
  return { title, content, type: 'definition', tags: [] };
}

export async function editDropWithAI(
  drop: { title: string; content: string; type: string; tags: string[]; codeSnippet?: string },
  instruction: string
): Promise<Omit<GeneratedDrop, 'type'> & { type: GeneratedDrop['type'] }> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return { ...drop, type: drop.type as GeneratedDrop['type'] };
  }

  const systemPrompt = `Eres un editor de "drops" de conocimiento para una app de aprendizaje.
Un drop tiene: título, contenido (2-5 oraciones densas), tipo, tags, y opcionalmente codeSnippet.

Tipos válidos: definition, ruptura, puente, operativo, code.

Recibirás el drop actual y una instrucción de edición. Aplica SOLO los cambios que pide la instrucción.
Si el usuario no pide cambiar el tipo, mantenlo. Si no pide cambiar los tags, mantenlos.
Si hay cambio de tags, conserva el primer tag como subcategoría estable y clara.

Responde ÚNICAMENTE con JSON válido:
{
  "title": "string",
  "content": "string",
  "type": "definition|ruptura|puente|operativo|code",
  "tags": ["string"],
  "codeSnippet": "string o null"
}

Sin texto antes ni después del JSON.`;

  const userPrompt = `Drop actual:
- Título: ${drop.title}
- Tipo: ${drop.type}
- Tags: ${drop.tags.join(', ')}
- Contenido: ${drop.content}
${drop.codeSnippet ? `- Código: ${drop.codeSnippet}` : ''}

Instrucción: ${instruction}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error('Groq API error');

    const data: GroqResponse = await response.json();
    const raw = data.choices[0]?.message?.content || '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const parsed = JSON.parse(cleaned);
    const VALID_TYPES = ['definition', 'ruptura', 'puente', 'operativo', 'code'];

    const title = String(parsed.title || drop.title).slice(0, 200);
    const content = String(parsed.content || drop.content).slice(0, 5000);
    const type = VALID_TYPES.includes(parsed.type) ? parsed.type : drop.type as GeneratedDrop['type'];
    const rawTags = Array.isArray(parsed.tags)
      ? parsed.tags.slice(0, 10).map((t: string) => String(t).slice(0, 30))
      : drop.tags;
    const tags = normalizeTags({ tags: rawTags, type, title, content, collectionId: undefined });

    return {
      title,
      content,
      type,
      tags,
      codeSnippet: parsed.codeSnippet ? String(parsed.codeSnippet) : undefined,
    };
  } catch {
    return { ...drop, type: drop.type as GeneratedDrop['type'] };
  }
}

function generateFallbackDrops(topic: string): GeneratedDrop[] {
  return [
    {
      title: topic,
      content: `Para usar generación con IA, configura tu API key de Groq en el archivo .env:\n\nVITE_GROQ_API_KEY=tu_key\n\nObtén una en console.groq.com — es gratis.`,
      type: 'definition',
      tags: ['pendiente', 'ia'],
    },
  ];
}

export async function chatWithGroq(
  messages: GroqMessage[],
  context?: { title: string; content: string; type: string }
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return simulateResponse(context);
  }

  const systemPrompt = `Eres un asistente de aprendizaje amigable y curioso. Ayudas al usuario a profundizar en conceptos, hacer conexiones, y entender mejor lo que está aprendiendo.

${context ? `El usuario está preguntando sobre este "drop" de conocimiento:
- Título: "${context.title}"
- Tipo: ${context.type}
- Contenido: "${context.content}"

Responde de forma conversacional, breve (2-3 párrafos máximo), y haz preguntas de segujo si es apropiado.` : ''}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || 'No pude generar una respuesta.';
  } catch {
    // Silent fail - fallback to simulateResponse
    return simulateResponse(context);
  }
}

function simulateResponse(context?: { title: string; content: string; type: string }): string {
  const responses = [
    `Interesante pregunta sobre "${context?.title || 'este tema'}". Permíteme pensar...`,
    `Esto me recuerda a algo fascinante. ¿Sabías que...`,
    `Una forma de pensarlo es conectándolo con otros conceptos que has aprendido.`,
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return `${randomResponse}

**Nota:** Para usar IA real, configura tu API key de Groq en el archivo \`.env\`

1. Ve a https://console.groq.com/
2. Crea una API key
3. Agrega \`VITE_GROQ_API_KEY=tu_key\` en el archivo .env
4. Reinicia el servidor

¿Te gustaría que te ayude a profundizar en "${context?.title}" desde otra perspectiva?`;
}

export function generateQuizQuestion(
  drop: { title: string; content: string; type?: string },
  allDrops?: { title: string; type?: string }[]
): {
  question: string;
  options: string[];
  correctIndex: number;
} {
  let distractors: string[];
  if (allDrops && allDrops.length > 3) {
    const others = allDrops
      .filter(d => d.title !== drop.title)
      .sort((a, b) => (a.type === drop.type ? -1 : 0) - (b.type === drop.type ? -1 : 0));
    distractors = others.slice(0, 3).map(d => d.title);
  } else {
    distractors = ['Otra opción A', 'Otra opción B', 'Otra opción C'];
  }

  // Bug fix #2: construir pool con marcador ANTES de shuffle, recuperar índice DESPUÉS
  const pool = [
    { text: drop.title, correct: true },
    ...distractors.map(t => ({ text: t, correct: false })),
  ];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return {
    question: `¿Qué concepto se describe como: "${drop.content.substring(0, 100)}..."?`,
    options: shuffled.map(o => o.text),
    correctIndex: shuffled.findIndex(o => o.correct),
  };
}

const DIFFICULTY_PROMPT: Record<string, string> = {
  facil: 'La pregunta debe ser directa — reconocimiento del concepto. Opciones claramente distintas.',
  medio: 'La pregunta debe requerir comprensión. Las opciones pueden ser cercanas pero distinguibles.',
  dificil: 'La pregunta debe requerir aplicación o síntesis. Las opciones deben ser muy cercanas y matizadas.',
};

export async function generateSmartQuizQuestion(
  drop: { id: string; title: string; content: string; type: string; tags: string[] },
  difficulty: Difficulty = 'medio'
): Promise<QuizQuestion> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackQuizQuestion(drop, difficulty);
  }

  const difficultyHint = DIFFICULTY_PROMPT[difficulty] ?? DIFFICULTY_PROMPT.medio;

  const systemPrompt = `Eres un generador de preguntas de quiz para aprendizaje.
Tu tarea: crear una pregunta de opción múltiple que NO copie el título.

Dificultad: ${difficulty.toUpperCase()}. ${difficultyHint}

Tipos de drop y cómo preguntar:
- definition: "¿Qué concepto describe...?" o "¿Cuál es la característica clave de...?"
- ruptura: "¿Cuál es la idea contraintuitiva en...?" o presenta la creencia común como trampa
- puente: "¿Qué conecta X con Y?"
- operativo: "¿Qué método/paso aplica cuando...?"
- code: "¿Qué hace este fragmento?" o "¿Por qué este código falla?"

Responde ÚNICAMENTE con JSON válido:
{
  "question": "pregunta clara y sin ambigüedad",
  "options": ["respuesta correcta", "distractor 1", "distractor 2", "distractor 3"],
  "correctIndex": 0,
  "explanation": "explicación breve"
}`;

  const userPrompt = `Genera una pregunta para este drop:
- Título: ${drop.title}
- Tipo: ${drop.type}
- Contenido: ${drop.content}
- Tags: ${drop.tags.join(', ')}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct-0905',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: 500,
      }),
    });

    if (!response.ok) throw new Error('Groq API error');

    const data: GroqResponse = await response.json();
    const raw = data.choices[0]?.message?.content || '';
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: { question: string; options: string[]; correctIndex: number; explanation: string } | null = null;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return generateFallbackQuizQuestion(drop, difficulty);
    }

    // Validación — Bug fix #9: example es opcional
    if (
      !parsed ||
      typeof parsed.question !== 'string' ||
      !Array.isArray(parsed.options) ||
      typeof parsed.correctIndex !== 'number' ||
      typeof parsed.explanation !== 'string'
    ) {
      return generateFallbackQuizQuestion(drop, difficulty);
    }

    if (parsed.options.length !== 4) {
      return generateFallbackQuizQuestion(drop, difficulty);
    }

    // Bug fix #4: si correctIndex inválido → fallback, no colapsar a 0
    if (parsed.correctIndex < 0 || parsed.correctIndex > 3) {
      return generateFallbackQuizQuestion(drop, difficulty);
    }

    return {
      dropId: drop.id,
      type: 'multiple-choice',
      difficulty,
      question: parsed.question,
      answer: parsed.options[parsed.correctIndex] ?? drop.title,
      explanation: parsed.explanation,
      options: parsed.options,
      correctIndex: parsed.correctIndex,
    };
  } catch {
    return generateFallbackQuizQuestion(drop, difficulty);
  }
}

function generateFallbackQuizQuestion(
  drop: { id: string; title: string; content: string; type: string; tags: string[] },
  difficulty: Difficulty = 'medio'
): QuizQuestion {
  // Bug fix #3: calcular correctIndex DESPUÉS de shuffle
  const options = [
    drop.title,
    'Otro concepto relacionado',
    'Una herramienta diferente',
    'Un proceso alternativo',
  ];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(drop.title);

  return {
    dropId: drop.id,
    type: 'multiple-choice',
    difficulty,
    question: `¿Qué concepto se describe como: "${drop.content.substring(0, 120)}..."?`,
    answer: drop.title,
    explanation: drop.content.substring(0, 200),
    options: shuffled,
    correctIndex,
  };
}
