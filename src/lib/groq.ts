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
