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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  example: string;
  dropId: string;
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
- Entre 2 y 6 oraciones de alta densidad informativa
- El título es el concepto central, no una descripción
- Tags: 3-5 términos en minúsculas, sin espacios, separados, relevantes para búsqueda
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
      .map((d) => ({
        title: d.title.slice(0, 200),
        content: d.content.slice(0, 5000),
        type: d.type,
        tags: d.tags.slice(0, 10).map((t: string) => String(t).slice(0, 30)),
        codeSnippet: d.codeSnippet ? String(d.codeSnippet) : undefined,
      }));
  } catch {
    return generateFallbackDrops(topic);
  }
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
Un drop tiene: título, contenido (2-6 oraciones densas), tipo, tags, y opcionalmente codeSnippet.

Tipos válidos: definition, ruptura, puente, operativo, code.

Recibirás el drop actual y una instrucción de edición. Aplica SOLO los cambios que pide la instrucción.
Si el usuario no pide cambiar el tipo, mantenlo. Si no pide cambiar los tags, mantenlos.

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

    return {
      title: String(parsed.title || drop.title).slice(0, 200),
      content: String(parsed.content || drop.content).slice(0, 5000),
      type: VALID_TYPES.includes(parsed.type) ? parsed.type : drop.type as GeneratedDrop['type'],
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.slice(0, 10).map((t: string) => String(t).slice(0, 30))
        : drop.tags,
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

export function generateQuizQuestion(drop: { title: string; content: string }): {
  question: string;
  options: string[];
  correctIndex: number;
} {
  return {
    question: `¿Qué concepto se describe como: "${drop.content.substring(0, 100)}..."?`,
    options: [drop.title, 'Otra opción A', 'Otra opción B', 'Otra opción C'].sort(() => Math.random() - 0.5),
    correctIndex: 0,
  };
}

export async function generateSmartQuizQuestion(
  drop: { id: string; title: string; content: string; type: string; tags: string[] }
): Promise<QuizQuestion> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return generateFallbackQuizQuestion(drop);
  }

  const systemPrompt = `Eres un generador de preguntas de quiz para aprendizaje. 
Tu tarea es crear PREGUNTAS DIFERENTES al título original del concepto.
NO copies el título como pregunta. Parafrasea, usa otras palabras, analogías o ejemplos diferentes.

Genera preguntas que:
1. Usen otras palabras diferentes al título
2. Presenten un caso práctico o ejemplo del trabajo
3. Hagan pensar al estudiante, no solo memorizar

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "question": "tu pregunta parafraseada",
  "options": ["respuesta correcta", "distractor 1", "distractor 2", "distractor 3"],
  "correctIndex": 0,
  "explanation": "explicación breve de por qué es correcta",
  "example": "ejemplo práctico o caso de uso"
}`;

  const userPrompt = `Genera una pregunta de quiz para este concepto:
- Título: ${drop.title}
- Contenido: ${drop.content}
- Tipo: ${drop.type}
- Tags: ${drop.tags.join(', ')}

Recuerda: La pregunta NO debe ser exactamente el título. Usa otras palabras.`;

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
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data: GroqResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    let parsed: QuizQuestion | null = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      return generateFallbackQuizQuestion(drop);
    }

    if (!parsed || 
        typeof parsed.question !== 'string' || 
        !Array.isArray(parsed.options) || 
        typeof parsed.correctIndex !== 'number' ||
        typeof parsed.explanation !== 'string' ||
        typeof parsed.example !== 'string') {
      return generateFallbackQuizQuestion(drop);
    }

    if (parsed.options.length !== 4) {
      return generateFallbackQuizQuestion(drop);
    }

    if (parsed.correctIndex < 0 || parsed.correctIndex > 3) {
      parsed.correctIndex = 0;
    }

    return {
      ...parsed,
      dropId: drop.id,
    };
  } catch {
    return generateFallbackQuizQuestion(drop);
  }
}

function generateFallbackQuizQuestion(
  drop: { id: string; title: string; content: string; type: string; tags: string[] }
): QuizQuestion {
  return {
    question: `¿Qué concepto se describe como: "${drop.content.substring(0, 120)}..."?`,
    options: [
      drop.title,
      'Otro concepto relacionado',
      'Una herramienta diferente',
      'Un proceso alternativo',
    ].sort(() => Math.random() - 0.5),
    correctIndex: 0,
    explanation: 'Esta es la respuesta correcta basada en el contenido del drop.',
    example: 'Ejemplo: Aplicando este concepto en tu trabajo diario...',
    dropId: drop.id,
  };
}
