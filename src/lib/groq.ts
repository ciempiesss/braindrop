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
    
    const parsed = JSON.parse(content);
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
