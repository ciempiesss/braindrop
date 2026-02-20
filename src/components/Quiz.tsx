import { useState, useEffect } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { Target, ChevronRight, Check, X, RotateCcw, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateSmartQuizQuestion, generateQuizQuestion, type QuizQuestion } from '@/lib/groq';
import type { Drop } from '@/types';

type QuizMode = 'flashcard' | 'multiple-choice';

const SETTINGS_KEY = 'braindrop_settings';

interface QuizSettings {
  quizMode?: 'ia' | 'pregenerated';
  quizCount?: number;
}

function loadQuizSettings(): QuizSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return { quizMode: 'pregenerated', quizCount: 10 };
}

export function Quiz({ onClose }: { onClose?: () => void }) {
  const { drops, reviewDrop } = useBrainDrop();
  const settings = loadQuizSettings();
  const [mode, setMode] = useState<QuizMode>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [quizDrops, setQuizDrops] = useState<Drop[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);

  const quizCount = settings.quizCount || 10;
  const useIAMode = settings.quizMode === 'ia';

  useEffect(() => {
    const allDrops = [...drops].sort(() => Math.random() - 0.5).slice(0, quizCount);
    setQuizDrops(allDrops);
  }, [drops, quizCount]);

  useEffect(() => {
    if (quizDrops.length === 0) return;
    
    if (useIAMode) {
      generateQuestionsWithIA();
    } else {
      generateQuestionsPreGenerated();
    }
  }, [quizDrops]);

  const generateQuestionsWithIA = async () => {
    setIsGenerating(true);
    const questions: QuizQuestion[] = [];
    
    for (const drop of quizDrops) {
      const q = await generateSmartQuizQuestion(drop);
      questions.push(q);
    }
    
    setQuizQuestions(questions);
    setCurrentQuestion(questions[0] || null);
    setIsGenerating(false);
  };

  const generateQuestionsPreGenerated = () => {
    const questions: QuizQuestion[] = quizDrops.map((drop) => {
      const basic = generateQuizQuestion(drop);
      return {
        ...basic,
        explanation: drop.content.substring(0, 200),
        example: 'Aplicación práctica del concepto en tu trabajo.',
        dropId: drop.id,
      };
    });
    setQuizQuestions(questions);
    setCurrentQuestion(questions[0] || null);
  };

  const currentDrop = quizDrops[currentIndex];

  const handleQuality = (quality: number) => {
    if (!currentDrop) return;

    reviewDrop(currentDrop.id, quality);

    if (quality >= 3) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }

    setShowExplanation(true);
  };

  const handleMultipleChoice = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    
    const isCorrect = currentQuestion && optionIndex === currentQuestion.correctIndex;
    handleQuality(isCorrect ? 4 : 1);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentIndex + 1 >= quizQuestions.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setCurrentQuestion(quizQuestions[currentIndex + 1]);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setShowChat(false);
    
    const shuffledDrops = [...drops].sort(() => Math.random() - 0.5).slice(0, quizCount);
    setQuizDrops(shuffledDrops);
  };

  if (isGenerating) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#7c3aed] animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-[#e7e9ea] mb-2">Generando Quiz con IA</h2>
          <p className="text-[#71767b]">Creando preguntas personalizadas...</p>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0 || !currentQuestion) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
            <Target className="w-10 h-10 text-[#7c3aed]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-[#e7e9ea]">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (completed) {
    const total = correctCount + incorrectCount;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>

          <h2 className="text-2xl font-bold mb-2 text-[#e7e9ea]">¡Sesión completada!</h2>
          <p className="text-[#71767b] mb-6">
            {correctCount} correctas · {incorrectCount} incorrectas
          </p>

          <button
            onClick={restart}
            className="inline-flex items-center gap-2 bg-[#7c3aed] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#7c3aed]/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Otra ronda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <button onClick={onClose} className="text-[#71767b] hover:text-[#e7e9ea]">
                ✕
              </button>
            )}
            <h1 className="text-xl font-bold text-[#e7e9ea]">Quiz</h1>
            {useIAMode && <span className="text-xs bg-[#7c3aed]/20 text-[#7c3aed] px-2 py-1 rounded">🤖 IA</span>}
          </div>
          <span className="text-sm text-[#71767b]">
            {currentIndex + 1} / {quizQuestions.length}
          </span>
        </div>

        <div className="w-full bg-[#181818] rounded-full h-2">
          <div
            className="bg-[#7c3aed] h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setMode('flashcard')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'flashcard'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#181818] text-[#71767b] hover:text-[#e7e9ea]'
            )}
          >
            Flashcard
          </button>
          <button
            onClick={() => setMode('multiple-choice')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'multiple-choice'
                ? 'bg-[#7c3aed] text-white'
                : 'bg-[#181818] text-[#71767b] hover:text-[#e7e9ea]'
            )}
          >
            Opción múltiple
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {mode === 'flashcard' ? (
          <div className="w-full max-w-lg">
            <div
              onClick={() => !showExplanation && setShowAnswer(true)}
              className={cn(
                'min-h-[300px] bg-[#16181c] border border-[#2f3336] rounded-xl p-6 cursor-pointer transition-all',
                showAnswer ? 'ring-2 ring-[#7c3aed]' : 'hover:border-[#7c3aed]/50'
              )}
            >
              <p className="text-sm text-[#71767b] mb-2">Pregunta:</p>
              <h3 className="text-xl font-bold mb-6 text-[#e7e9ea]">{currentQuestion.question}</h3>

              {!showAnswer ? (
                <div className="text-center py-8">
                  <p className="text-[#71767b]">Toca para ver la respuesta</p>
                  <ChevronRight className="w-6 h-6 mx-auto mt-2 text-[#71767b] animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#71767b] mb-2">Respuesta:</p>
                  <p className="text-[#e7e9ea] leading-relaxed mb-4">{currentDrop?.content}</p>

                  {currentQuestion.example && (
                    <div className="bg-[#7c3aed]/10 rounded-lg p-3 mb-4">
                      <p className="text-xs text-[#7c3aed] mb-1">Ejemplo:</p>
                      <p className="text-sm text-[#e7e9ea]">{currentQuestion.example}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {showExplanation ? (
              <div className="space-y-3 mt-4">
                <div className="bg-[#181818] rounded-xl p-4">
                  <p className="text-sm text-[#71767b] mb-2">Explicación:</p>
                  <p className="text-[#e7e9ea] text-sm">{currentQuestion.explanation}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="flex-1 py-3 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] font-semibold flex items-center justify-center gap-2 hover:bg-[#7c3aed]/20 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Preguntar a IA
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-[#7c3aed] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#7c3aed]/90 transition-colors"
                  >
                    Siguiente
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              showAnswer && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleQuality(1)}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Otra vez
                  </button>
                  <button
                    onClick={() => handleQuality(4)}
                    className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-400 font-semibold flex items-center justify-center gap-2 hover:bg-green-500/20 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Bien
                  </button>
                </div>
              )
            )}
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-6 mb-4">
                <p className="text-sm text-[#71767b] mb-2">Pregunta:</p>
                <h3 className="text-xl font-bold text-[#e7e9ea]">{currentQuestion.question}</h3>
              </div>

              <div className="space-y-2">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMultipleChoice(idx)}
                    disabled={selectedOption !== null}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all',
                      selectedOption === null
                        ? 'bg-[#16181c] border border-[#2f3336] hover:border-[#7c3aed] text-[#e7e9ea]'
                        : idx === currentQuestion.correctIndex
                          ? 'bg-green-500/10 border-2 border-green-500 text-[#e7e9ea]'
                          : selectedOption === idx
                            ? 'bg-red-500/10 border-2 border-red-500 text-[#e7e9ea]'
                            : 'bg-[#16181c] border border-[#2f3336] text-[#e7e9ea] opacity-50'
                    )}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="space-y-3 mt-4">
                  <div className="bg-[#181818] rounded-xl p-4">
                    <p className="text-sm text-[#71767b] mb-2">Explicación:</p>
                    <p className="text-[#e7e9ea] text-sm">{currentQuestion.explanation}</p>
                  </div>

                  <button
                    onClick={() => setShowChat(true)}
                    className="w-full py-3 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] font-semibold flex items-center justify-center gap-2 hover:bg-[#7c3aed]/20 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Preguntar a IA sobre este tema
                  </button>
                </div>
              )}

              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="w-full py-3 mt-3 rounded-xl bg-[#7c3aed] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#7c3aed]/90 transition-colors"
                >
                  Siguiente pregunta
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
      </div>

      {showChat && currentDrop && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1f] rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#2f3336]">
              <h3 className="font-bold text-[#e7e9ea]">Chat con IA</h3>
              <button onClick={() => setShowChat(false)} className="text-[#71767b] hover:text-[#e7e9ea]">
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto text-[#e7e9ea] text-sm">
              <p className="text-[#71767b] mb-4">
                Puedes preguntar sobre: <strong>{currentDrop.title}</strong>
              </p>
              <p className="text-[#71767b] text-center mt-8">
                Configura tu API key de Groq para usar el chat con IA.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
