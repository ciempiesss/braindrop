import { useState } from 'react';
import { chatWithGroq } from '@/lib/groq';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  dropTitle?: string;
  dropContent?: string;
  dropType?: string;
  onClose: () => void;
}

export function AIChat({ dropTitle, dropContent, dropType, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: dropTitle
        ? `Hola! Puedo ayudarte a profundizar en "${dropTitle}". ¿Qué te gustaría saber?`
        : 'Hola! Soy tu asistente de aprendizaje. ¿En qué puedo ayudarte?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const groqMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      groqMessages.push({ role: 'user', content: input });

      const response = await chatWithGroq(groqMessages, {
        title: dropTitle || '',
        content: dropContent || '',
        type: dropType || '',
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        },
      ]);
    }

    setIsLoading(false);
  };

  const suggestions = [
    'Explícame más',
    'Dame un ejemplo',
    '¿Qué conexiones tiene?',
    'Hazme una pregunta',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] w-full sm:w-[500px] sm:rounded-2xl border border-[#2f3336] shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[600px]">
        <div className="flex items-center justify-between p-4 border-b border-[#2f3336]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-bold text-[#e7e9ea]">Asistente IA</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#71767b] hover:text-[#e7e9ea] text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {dropTitle && (
          <div className="px-4 py-2 bg-[#16181c] border-b border-[#2f3336]">
            <p className="text-xs text-[#71767b]">Contexto:</p>
            <p className="text-sm text-[#a78bfa] font-medium truncate">{dropTitle}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#7c3aed] text-white'
                    : 'bg-[#16181c] text-[#d4d4d4] border border-[#2f3336]'
                )}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#16181c] rounded-2xl px-4 py-3 border border-[#2f3336]">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-[#7c3aed] rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#2f3336]">
          <div className="flex gap-2 mb-2 overflow-x-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="px-3 py-1.5 bg-[#16181c] border border-[#2f3336] rounded-full text-xs text-[#a0a0a0] hover:border-[#7c3aed] hover:text-[#7c3aed] transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Pregunta algo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-full px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#7c3aed] text-[#e7e9ea] placeholder:text-[#71767b]"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-5 py-2.5 bg-[#7c3aed] text-white rounded-full font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
