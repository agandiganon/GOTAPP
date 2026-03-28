"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { fisherYatesShuffle } from "@/lib/utils";
import type {
  CharacterRecord,
  CharacterTimelineEntry,
  EpisodeRecord,
  LocationRecord,
  LocationHistoryEntry,
  FactionRecord,
} from "@/data/schemas";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: "location" | "character" | "faction" | "event";
}

interface QuizContentProps {
  visibleCharacters: (CharacterRecord & { latestState: CharacterTimelineEntry })[];
  visibleLocations: (LocationRecord & { latestHistory: LocationHistoryEntry })[];
  factions: FactionRecord[];
  currentEpisode: EpisodeRecord;
}

function generateQuestions(
  characters: (CharacterRecord & { latestState: CharacterTimelineEntry })[],
  locations: (LocationRecord & { latestHistory: LocationHistoryEntry })[],
  factions: FactionRecord[],
  episode: EpisodeRecord,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Question 1: Primary location
  if (episode.primaryLocationId && locations.length > 0) {
    const primaryLoc = locations.find((l) => l.id === episode.primaryLocationId);
    if (primaryLoc) {
      const otherLocs = locations
        .filter((l) => l.id !== episode.primaryLocationId)
        .slice(0, 3);
      const options = [primaryLoc.name, ...otherLocs.map((l) => l.name)];
      const shuffled = fisherYatesShuffle(options);
      questions.push({
        id: "q1",
        question: `איזה מיקום היה מוקד הפרק?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(primaryLoc.name),
        explanation: `${primaryLoc.name} היה מוקד הפרק. ${
          primaryLoc.latestHistory?.summary || ""
        }`,
        type: "location",
      });
    }
  }

  // Question 2: Character status
  if (characters.length > 0) {
    const activeCharacters = characters.filter(
      (c) => !["dead", "missing"].includes(c.latestState.status),
    );
    if (activeCharacters.length > 0) {
      const randomChar = activeCharacters[
        Math.floor(Math.random() * activeCharacters.length)
      ];
      const statusLabel = randomChar.latestState.statusLabel || randomChar.latestState.status;
      const wrongStatuses = [
        "מת",
        "חי",
        "פצוע",
        "כלוא",
        "נודד",
        "נעדר",
      ].filter((s) => s !== statusLabel);
      const options = [statusLabel, ...wrongStatuses.slice(0, 3)];
      const shuffled = fisherYatesShuffle(options);
      questions.push({
        id: "q2",
        question: `מה היה המצב של ${randomChar.name} בפרק זה?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(statusLabel),
        explanation: `${randomChar.name} היה/הייתה ${statusLabel} בפרק זה.`,
        type: "character",
      });
    }
  }

  // Question 3: Event
  if (episode.turningPoints && episode.turningPoints.length > 0) {
    const randomEvent = episode.turningPoints[
      Math.floor(Math.random() * episode.turningPoints.length)
    ];
    const eventSummary = randomEvent.summary;
    // Use first 60 chars of the summary as the correct option (readable length)
    const correctOption = eventSummary.length > 60
      ? eventSummary.substring(0, 60) + "..."
      : eventSummary;

    // Collect wrong answers from other turning points in the episode
    const otherEvents = episode.turningPoints
      .filter((tp) => tp.summary !== eventSummary)
      .slice(0, 3)
      .map((tp) => tp.summary.length > 60
        ? tp.summary.substring(0, 60) + "..."
        : tp.summary);

    const options = otherEvents.length >= 3
      ? [correctOption, ...otherEvents]
      : [correctOption]; // Fallback if not enough wrong answers

    const shuffled = fisherYatesShuffle(options);
    questions.push({
      id: "q3",
      question: `מה התרחש בפרק זה?`,
      options: shuffled.slice(0, 4),
      correctIndex: shuffled.indexOf(correctOption),
      explanation: `אירוע זה: ${eventSummary}`,
      type: "event",
    });
  }

  // Question 4: Locations
  if (episode.mainLocationIds && locations.length > 1) {
    const mainLocs = locations.filter((l) =>
      episode.mainLocationIds.includes(l.id),
    );
    if (mainLocs.length > 0) {
      const randomLoc = mainLocs[Math.floor(Math.random() * mainLocs.length)];
      const otherLocs = locations
        .filter((l) => l.id !== randomLoc.id)
        .slice(0, 3);
      const options = [randomLoc.region || randomLoc.name, ...otherLocs.map((l) => l.region || l.name)];
      const shuffled = fisherYatesShuffle(options);
      questions.push({
        id: "q4",
        question: `באיזה אזור נמצא ${randomLoc.name}?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(randomLoc.region || randomLoc.name),
        explanation: `${randomLoc.name} נמצא באזור ${randomLoc.region || "לא מוגדר"}.`,
        type: "location",
      });
    }
  }

  // Question 5: Focus characters
  if (episode.focusCharacterIds && characters.length > 0) {
    const focusChars = characters.filter((c) =>
      episode.focusCharacterIds.includes(c.id),
    );
    if (focusChars.length > 0) {
      const randomFocusChar = focusChars[
        Math.floor(Math.random() * focusChars.length)
      ];
      const otherChars = characters
        .filter((c) => c.id !== randomFocusChar.id)
        .slice(0, 3);
      const options = [randomFocusChar.name, ...otherChars.map((c) => c.name)];
      const shuffled = fisherYatesShuffle(options);
      questions.push({
        id: "q5",
        question: `איזה דמות הייתה ממוקדת בפרק זה?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(randomFocusChar.name),
        explanation: `${randomFocusChar.name} הייתה דמות ממוקדת בפרק זה.`,
        type: "character",
      });
    }
  }

  return questions.slice(0, 5);
}

export function QuizContent({
  visibleCharacters,
  visibleLocations,
  factions,
  currentEpisode,
}: QuizContentProps) {
  const questions = useMemo(
    () =>
      generateQuestions(
        visibleCharacters,
        visibleLocations,
        factions,
        currentEpisode,
      ),
    [visibleCharacters, visibleLocations, factions, currentEpisode],
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered =
    selectedAnswers[currentQuestionIndex] !== undefined;
  const isCorrect =
    selectedAnswers[currentQuestionIndex] === currentQuestion?.correctIndex;

  const handleSelectOption = (index: number) => {
    if (!showResults) {
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestionIndex] = index;
      setSelectedAnswers(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
  };

  const correctCount = selectedAnswers.filter(
    (answer, idx) => answer === questions[idx]?.correctIndex,
  ).length;

  if (questions.length === 0) {
    return (
      <div
        className="rounded-[20px] border border-stone-700/35 p-8 text-center"
        style={{ background: "rgba(16,20,32,0.68)" }}
      >
        <p className="text-xl font-display text-ink">
          אין מספיק מידע ליצירת חידון
        </p>
        <p className="text-sm text-muted mt-2">
          בחר פרק עם יותר מידע כדי ליצור חידון.
        </p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div
        className="rounded-[20px] border border-stone-700/35 p-8 text-center space-y-6"
        style={{ background: "rgba(16,20,32,0.68)" }}
      >
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
            תוצאות החידון
          </p>
          <h3 className="font-display text-3xl text-accent mt-2">
            {correctCount}/{questions.length}
          </h3>
          <p className="text-stone-400 mt-2">
            {correctCount === questions.length
              ? "מושלם! אתה ממלך המשחק!"
              : correctCount >= questions.length * 0.6
                ? "כל הכבוד! ביצוע טוב!"
                : "עדיין הרבה מה ללמוד על ווסטרוס!"}
          </p>
        </div>

        {/* Detailed results */}
        <div className="space-y-3 text-left">
          {questions.map((q, idx) => {
            const isCorrectAnswer =
              selectedAnswers[idx] === q.correctIndex;
            return (
              <div
                key={q.id}
                className="p-3 rounded-[12px] border"
                style={{
                  background: isCorrectAnswer
                    ? "rgba(100,200,130,0.08)"
                    : "rgba(255,100,100,0.08)",
                  borderColor: isCorrectAnswer
                    ? "rgba(100,200,130,0.2)"
                    : "rgba(255,100,100,0.2)",
                }}
              >
                <div className="flex items-start gap-2">
                  {isCorrectAnswer ? (
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-ink">{q.question}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      תשובתך: {q.options[selectedAnswers[idx]]}
                    </p>
                    {!isCorrectAnswer && (
                      <p className="text-xs text-green-400/80 mt-1">
                        תשובה נכונה: {q.options[q.correctIndex]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-sm font-medium transition-all active:scale-95"
          style={{
            background: "rgb(210,168,90)",
            color: "rgb(8,10,16)",
          }}
        >
          <RotateCcw className="h-4 w-4" />
          חידון חדש
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] border border-stone-700/35 p-6 space-y-6"
      style={{ background: "rgba(16,20,32,0.68)" }}
    >
      {/* Header */}
      <div>
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
          שאלה {currentQuestionIndex + 1} מ-{questions.length}
        </p>
        <div className="mt-2 h-1 bg-stone-800/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              background: "rgb(210,168,90)",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="font-display text-xl text-ink">{currentQuestion.question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === idx;
          const isCorrectOption = idx === currentQuestion.correctIndex;
          const showCorrect = isAnswered && isCorrectOption;
          const showIncorrect = isAnswered && isSelected && !isCorrectOption;

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className="w-full p-3 rounded-[12px] border text-right transition-all text-sm font-medium"
              style={{
                background: showCorrect
                  ? "rgba(100,200,130,0.12)"
                  : showIncorrect
                    ? "rgba(255,100,100,0.12)"
                    : isSelected
                      ? "rgba(210,168,90,0.12)"
                      : "rgba(255,255,255,0.04)",
                borderColor: showCorrect
                  ? "rgba(100,200,130,0.3)"
                  : showIncorrect
                    ? "rgba(255,100,100,0.3)"
                    : isSelected
                      ? "rgba(210,168,90,0.3)"
                      : "rgba(255,255,255,0.1)",
                color: showCorrect
                  ? "rgb(100,200,130)"
                  : showIncorrect
                    ? "rgb(255,100,100)"
                    : isSelected
                      ? "rgb(210,168,90)"
                      : "rgb(232,228,220)",
                cursor: isAnswered ? "default" : "pointer",
                opacity: isAnswered && !showCorrect && !showIncorrect && !isSelected ? 0.5 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{option}</span>
                {showCorrect && <CheckCircle className="h-4 w-4" />}
                {showIncorrect && <XCircle className="h-4 w-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (show after answered) */}
      {isAnswered && (
        <div
          className="p-3 rounded-[12px] border"
          style={{
            background: "rgba(210,168,90,0.08)",
            borderColor: "rgba(210,168,90,0.2)",
          }}
        >
          <p className="text-xs text-stone-300">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 rounded-[12px] text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgb(232,228,220)",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
          }}
        >
          הקודמת
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={!isAnswered}
          className="px-6 py-2 rounded-[12px] text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: "rgb(210,168,90)",
            color: "rgb(8,10,16)",
            cursor: !isAnswered ? "not-allowed" : "pointer",
          }}
        >
          {currentQuestionIndex === questions.length - 1
            ? "הצג תוצאות"
            : "הבאה"}
        </button>
      </div>
    </div>
  );
}
