import { useState, useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { Target, ChevronRight, Check, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizMode = 'flashcard' | 'multiple-choice';

export function Quiz() {
  const { getDropsForReview, reviewDrop } = useBrainDrop();
  const [mode, setMode] = useState<QuizMode>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const dropsForReview = getDropsForReview();
  const currentDrop = dropsForReview[currentIndex];

  const options = useMemo(() => {
    if (!currentDrop) return [];
    const otherDrops = dropsForReview.filter((d) => d.id !== currentDrop.id);
    const shuffled = otherDrops
      .map((item, idx) => ({ item, rand: Math.sin(currentIndex * 1000 + idx) * 10000 }))
      .sort((a, b) => a.rand - b.rand)
      .slice(0, 3)
      .map(({ item }) => item);
    const opts = [currentDrop, ...shuffled]
      .map((item, idx) => ({ item, rand: Math.sin(currentIndex * 2000 + idx) * 10000 }))
      .sort((a, b) => a.rand - b.rand)
      .map(({ item }) => item);
    return opts.map((d, i) => ({
      id: i,
      text: d.title,
      content: d.content,
      isCorrect: d.id === currentDrop.id,
    }));
  }, [currentDrop, dropsForReview, currentIndex]);

  const handleQuality = (quality: number) => {
    if (!currentDrop) return;

    reviewDrop(currentDrop.id, quality);

    if (quality >= 3) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
    }

    setShowAnswer(false);
    setSelectedOption(null);

    if (currentIndex + 1 >= dropsForReview.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleMultipleChoice = (optionId: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionId);
    const option = options.find((o) => o.id === optionId);
    handleQuality(option?.isCorrect ? 4 : 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setSelectedOption(null);
  };

  if (dropsForReview.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">¡Todo al día!</h2>
          <p className="text-muted-foreground">No hay drops para repasar ahora</p>
        </div>
      </div>
    );
  }

  if (completed) {
    const total = correctCount + incorrectCount;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">{percentage}%</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">¡Sesión completada!</h2>
          <p className="text-muted-foreground mb-6">
            {correctCount} correctas · {incorrectCount} incorrectas
          </p>

          <button
            onClick={restart}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Otra ronda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Quiz</h1>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {dropsForReview.length}
          </span>
        </div>

        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / dropsForReview.length) * 100}%` }}
          />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setMode('flashcard')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'flashcard'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            Flashcard
          </button>
          <button
            onClick={() => setMode('multiple-choice')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
              mode === 'multiple-choice'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            )}
          >
            Opción múltiple
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        {mode === 'flashcard' ? (
          <div className="w-full max-w-lg">
            <div
              onClick={() => setShowAnswer(true)}
              className={cn(
                'min-h-[300px] bg-card border border-border rounded-xl p-6 cursor-pointer transition-all',
                showAnswer ? 'ring-2 ring-primary' : 'hover:border-primary/50'
              )}
            >
              <p className="text-sm text-muted-foreground mb-2">Título:</p>
              <h3 className="text-xl font-bold mb-6">{currentDrop.title}</h3>

              {!showAnswer ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Toca para ver la respuesta</p>
                  <ChevronRight className="w-6 h-6 mx-auto mt-2 text-muted-foreground animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Respuesta:</p>
                  <p className="text-foreground leading-relaxed">{currentDrop.content}</p>

                  {currentDrop.codeSnippet && (
                    <pre className="mt-4 bg-secondary p-3 rounded-lg text-xs font-mono overflow-x-auto">
                      <code>{currentDrop.codeSnippet}</code>
                    </pre>
                  )}
                </>
              )}
            </div>

            {showAnswer && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleQuality(1)}
                  className="flex-1 py-3 rounded-xl bg-destructive/10 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Otra vez
                </button>
                <button
                  onClick={() => handleQuality(4)}
                  className="flex-1 py-3 rounded-xl bg-success/10 text-success font-semibold flex items-center justify-center gap-2 hover:bg-success/20 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Bien
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <div className="bg-card border border-border rounded-xl p-6 mb-4">
              <p className="text-sm text-muted-foreground mb-2">¿Qué es?</p>
              <h3 className="text-xl font-bold">{currentDrop.content}</h3>
            </div>

            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleMultipleChoice(option.id)}
                  disabled={selectedOption !== null}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all',
                    selectedOption === null
                      ? 'bg-card border border-border hover:border-primary'
                      : option.isCorrect
                        ? 'bg-success/10 border-2 border-success'
                        : selectedOption === option.id
                          ? 'bg-destructive/10 border-2 border-destructive'
                          : 'bg-card border border-border opacity-50'
                  )}
                >
                  <span className="font-medium">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
