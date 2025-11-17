import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, X, Trophy, Target, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  nextReview: Date;
  interval: number; // days until next review
  repetitions: number;
  efactor: number; // ease factor for spaced repetition
}

interface StudySession {
  totalCards: number;
  currentCard: number;
  correctAnswers: number;
  startTime: Date;
  type: 'spaced' | 'category' | 'all';
  category?: string;
}

export function StudyMode() {
  const [currentView, setCurrentView] = useState<'overview' | 'categories' | 'session' | 'results'>('overview');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [currentSessionCards, setCurrentSessionCards] = useState<Flashcard[]>([]);
  const [sessionResults, setSessionResults] = useState<{
    correct: number;
    total: number;
    timeSpent: number;
    cardsReviewed: Flashcard[];
  } | null>(null);

  // Initialize with sample flashcards
  useEffect(() => {
    const sampleCards: Flashcard[] = [
      {
        id: '1',
        question: 'What is machine learning?',
        answer: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.',
        difficulty: 'medium',
        category: 'Machine Learning',
        nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000), // Due yesterday
        interval: 1,
        repetitions: 0,
        efactor: 2.5
      },
      {
        id: '2',
        question: 'What are the three main types of machine learning?',
        answer: 'The three main types are: 1) Supervised Learning, 2) Unsupervised Learning, and 3) Reinforcement Learning.',
        difficulty: 'easy',
        category: 'Machine Learning',
        nextReview: new Date(Date.now() - 12 * 60 * 60 * 1000), // Due 12 hours ago
        interval: 2,
        repetitions: 1,
        efactor: 2.6
      },
      {
        id: '3',
        question: 'What is the difference between overfitting and underfitting?',
        answer: 'Overfitting occurs when a model learns the training data too well and fails to generalize. Underfitting occurs when a model is too simple to capture the underlying patterns.',
        difficulty: 'hard',
        category: 'Deep Learning',
        nextReview: new Date(Date.now() - 6 * 60 * 60 * 1000), // Due 6 hours ago
        interval: 3,
        repetitions: 2,
        efactor: 2.4
      },
      {
        id: '4',
        question: 'What is a neural network?',
        answer: 'A neural network is a computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information.',
        difficulty: 'medium',
        category: 'Deep Learning',
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
        interval: 4,
        repetitions: 3,
        efactor: 2.7
      },
      {
        id: '5',
        question: 'What is data preprocessing?',
        answer: 'Data preprocessing involves cleaning, transforming, and organizing raw data to make it suitable for machine learning algorithms.',
        difficulty: 'easy',
        category: 'Data Science',
        nextReview: new Date(Date.now() - 8 * 60 * 60 * 1000),
        interval: 2,
        repetitions: 1,
        efactor: 2.8
      },
      {
        id: '6',
        question: 'What is cross-validation?',
        answer: 'Cross-validation is a technique for assessing model performance by partitioning data into training and validation sets multiple times.',
        difficulty: 'medium',
        category: 'Data Science',
        nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000),
        interval: 5,
        repetitions: 4,
        efactor: 2.9
      },
      {
        id: '7',
        question: 'What is Python?',
        answer: 'Python is a high-level, interpreted programming language known for its simplicity and readability, widely used in data science and AI.',
        difficulty: 'easy',
        category: 'Programming',
        nextReview: new Date(Date.now() - 4 * 60 * 60 * 1000),
        interval: 1,
        repetitions: 0,
        efactor: 2.5
      },
      {
        id: '8',
        question: 'What are Python decorators?',
        answer: 'Decorators are functions that modify the behavior of other functions or classes without permanently modifying them.',
        difficulty: 'hard',
        category: 'Programming',
        nextReview: new Date(Date.now() + 6 * 60 * 60 * 1000),
        interval: 7,
        repetitions: 5,
        efactor: 3.1
      }
    ];

    setFlashcards(sampleCards);
    
    // Filter cards due for review
    const due = sampleCards.filter(card => card.nextReview <= new Date());
    setDueCards(due);

    // Extract unique categories
    const uniqueCategories = [...new Set(sampleCards.map(card => card.category))];
    setCategories(uniqueCategories);
  }, []);

  const startReviewSession = () => {
    if (dueCards.length === 0) {
      toast.error("No cards are due for review right now!");
      return;
    }

    setStudySession({
      totalCards: dueCards.length,
      currentCard: 0,
      correctAnswers: 0,
      startTime: new Date(),
      type: 'spaced'
    });
    setCurrentSessionCards(dueCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCurrentView('session');
    toast.success(`Starting spaced review session with ${dueCards.length} cards`);
  };

  const startCategoryReview = (category: string) => {
    const categoryCards = flashcards.filter(card => card.category === category);
    
    if (categoryCards.length === 0) {
      toast.error(`No flashcards found in ${category} category!`);
      return;
    }

    // Shuffle the cards for variety
    const shuffledCards = [...categoryCards].sort(() => Math.random() - 0.5);

    setStudySession({
      totalCards: categoryCards.length,
      currentCard: 0,
      correctAnswers: 0,
      startTime: new Date(),
      type: 'category',
      category: category
    });
    setCurrentSessionCards(shuffledCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCurrentView('session');
    toast.success(`Starting ${category} review session with ${categoryCards.length} cards`);
  };

  const showCategorySelection = () => {
    setCurrentView('categories');
  };

  const startStudyAll = () => {
    if (flashcards.length === 0) {
      toast.error("No flashcards available to study!");
      return;
    }

    // Shuffle all cards for variety
    const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);

    setStudySession({
      totalCards: flashcards.length,
      currentCard: 0,
      correctAnswers: 0,
      startTime: new Date(),
      type: 'all'
    });
    setCurrentSessionCards(shuffledCards);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCurrentView('session');
    toast.success(`Starting study session with all ${flashcards.length} cards`);
  };

  const calculateNextReview = (card: Flashcard, quality: number): Flashcard => {
    let newInterval = card.interval;
    let newRepetitions = card.repetitions;
    let newEfactor = card.efactor;

    if (quality >= 3) {
      // Correct answer
      if (newRepetitions === 0) {
        newInterval = 1;
      } else if (newRepetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * newEfactor);
      }
      newRepetitions += 1;
    } else {
      // Incorrect answer - reset
      newRepetitions = 0;
      newInterval = 1;
    }

    // Update ease factor
    newEfactor = newEfactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEfactor < 1.3) {
      newEfactor = 1.3;
    }

    return {
      ...card,
      interval: newInterval,
      repetitions: newRepetitions,
      efactor: newEfactor,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
    };
  };

  const handleAnswer = (quality: number) => {
    if (!studySession) return;

    const currentCard = currentSessionCards[currentCardIndex];
    
    // Only update spaced repetition for spaced review sessions
    if (studySession.type === 'spaced') {
      const updatedCard = calculateNextReview(currentCard, quality);
      
      // Update the flashcard in the main array
      setFlashcards(prev => 
        prev.map(card => card.id === currentCard.id ? updatedCard : card)
      );
    }

    // Update session stats
    const isCorrect = quality >= 3;
    setStudySession(prev => prev ? {
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
    } : null);

    // Move to next card or finish session
    if (currentCardIndex < currentSessionCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
      const feedbackMessage = studySession.type === 'spaced' 
        ? (isCorrect ? "Correct! Moving to next card" : "Don't worry, you'll see this again soon")
        : (isCorrect ? "Great job! Next card" : "Keep practicing! Next card");
      toast.success(feedbackMessage);
    } else {
      // Session complete
      finishSession();
    }
  };

  const finishSession = () => {
    if (!studySession) return;

    const timeSpent = Math.round((Date.now() - studySession.startTime.getTime()) / 1000 / 60); // minutes
    
    setSessionResults({
      correct: studySession.correctAnswers,
      total: studySession.totalCards,
      timeSpent,
      cardsReviewed: currentSessionCards
    });

    // Update due cards list only for spaced review sessions
    if (studySession.type === 'spaced') {
      const newDueCards = flashcards.filter(card => card.nextReview <= new Date());
      setDueCards(newDueCards);
    }

    setCurrentView('results');
    toast.success("Review session completed!");
  };

  const resetSession = () => {
    setCurrentView('overview');
    setStudySession(null);
    setSessionResults(null);
    setCurrentSessionCards([]);
    setSelectedCategory('');
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (currentView === 'results' && sessionResults) {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 md:w-10 h-8 md:h-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-light-primary mb-2">Session Complete!</h1>
            <p className="text-sm md:text-base text-gray-600">Great job on completing your review session</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="p-6 text-center light-shadow hover:light-shadow-lg transition-shadow duration-300">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {sessionResults.correct}/{sessionResults.total}
              </div>
              <p className="text-gray-600">Correct Answers</p>
            </Card>

            <Card className="p-6 text-center light-shadow hover:light-shadow-lg transition-shadow duration-300">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((sessionResults.correct / sessionResults.total) * 100)}%
              </div>
              <p className="text-gray-600">Accuracy</p>
            </Card>

            <Card className="p-6 text-center light-shadow hover:light-shadow-lg transition-shadow duration-300">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sessionResults.timeSpent}m
              </div>
              <p className="text-gray-600">Time Spent</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button onClick={resetSession} className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Overview
            </Button>
            {dueCards.length > 0 && (
              <Button onClick={startReviewSession} className="bg-green-600 hover:bg-green-700 text-white">
                Review More Cards
              </Button>
            )}
            <Button onClick={showCategorySelection} className="bg-purple-600 hover:bg-purple-700 text-white">
              Study by Category
            </Button>
            <Button onClick={startStudyAll} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Study All Cards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'session' && studySession) {
    const currentCard = currentSessionCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / studySession.totalCards) * 100;

    return (
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={resetSession}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Exit Session
                </Button>
                <span className="text-sm text-gray-600">
                  Card {currentCardIndex + 1} of {studySession.totalCards}
                  {studySession.type === 'category' && (
                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {studySession.category}
                    </span>
                  )}
                  {studySession.type === 'all' && (
                    <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      All Cards
                    </span>
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Correct: {studySession.correctAnswers}/{currentCardIndex + (showAnswer ? 1 : 0)}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Flashcard */}
          <Card className="p-4 md:p-8 mb-4 md:mb-6 min-h-[250px] md:min-h-[300px] flex flex-col justify-center bg-gradient-to-br from-white to-gray-50/30 shadow-xl shadow-gray-200/50 transition-all duration-700 hover:shadow-2xl hover:shadow-gray-300/50 hover:scale-[1.02] border-0 ring-1 ring-gray-200/50">
            <div className="text-center">
              <div className="mb-4 md:mb-6 transition-all duration-500">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 transition-colors duration-300">
                  {showAnswer ? 'Answer' : 'Question'}
                </h3>
                <div className="transition-all duration-700 transform">
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {showAnswer ? currentCard.answer : currentCard.question}
                  </p>
                </div>
              </div>

              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 group"
                >
                  <span className="transition-transform duration-300 group-hover:scale-110">Show Answer</span>
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {studySession.type === 'spaced' 
                      ? "How well did you know this?" 
                      : "Did you get this correct?"
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                    {studySession.type === 'spaced' ? (
                      <>
                        <Button
                          onClick={() => handleAnswer(1)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 md:px-6 py-2 flex items-center gap-2 text-sm md:text-base shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 group"
                        >
                          <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                          Again
                        </Button>
                        <Button
                          onClick={() => handleAnswer(3)}
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-3 md:px-6 py-2 flex items-center gap-2 text-sm md:text-base shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/40 group"
                        >
                          <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                          Hard
                        </Button>
                        <Button
                          onClick={() => handleAnswer(4)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 md:px-6 py-2 flex items-center gap-2 text-sm md:text-base shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 group"
                        >
                          <Target className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                          Good
                        </Button>
                        <Button
                          onClick={() => handleAnswer(5)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 md:px-6 py-2 flex items-center gap-2 text-sm md:text-base shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40 group"
                        >
                          <CheckCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                          Easy
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleAnswer(1)}
                          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Incorrect
                        </Button>
                        <Button
                          onClick={() => handleAnswer(4)}
                          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 flex items-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Correct
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Category selection screen
  if (currentView === 'categories') {
    return (
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => setCurrentView('overview')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-light-primary mb-2">Study by Category</h1>
            <p className="text-gray-600">Choose a category to focus your study session</p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map((category) => {
              const categoryCards = flashcards.filter(card => card.category === category);
              const dueInCategory = categoryCards.filter(card => card.nextReview <= new Date()).length;
              const learnedInCategory = categoryCards.filter(card => card.repetitions > 0).length;
              
              return (
                <Card 
                  key={category} 
                  className="p-6 light-shadow hover:light-shadow-lg transition-shadow cursor-pointer"
                  onClick={() => startCategoryReview(category)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category}</h3>
                    <p className="text-gray-600 mb-4">{categoryCards.length} total cards</p>
                    
                    <div className="flex justify-center gap-2 mb-6">
                      <Badge variant="secondary" className="text-xs">
                        {dueInCategory} due
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {learnedInCategory} learned
                      </Badge>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white py-3 rounded-xl">
                      Study {category}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Category Stats */}
          <Card className="p-6 light-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Overview</h3>
            <div className="space-y-3">
              {categories.map((category) => {
                const categoryCards = flashcards.filter(card => card.category === category);
                const progress = categoryCards.length > 0 
                  ? (categoryCards.filter(card => card.repetitions > 0).length / categoryCards.length) * 100
                  : 0;
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg light-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {categoryCards.length} cards
                      </div>
                      <div className="w-24">
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600 w-12 text-right">
                        {Math.round(progress)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Overview screen
  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-light-cta mb-3">Choose Your Study Mode</h1>
          <p className="text-lg text-gray-600">Select how you'd like to study your flashcards today</p>
        </div>

        {/* Study Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Spaced Review Card */}
          <Card className="p-8 text-center light-shadow hover:light-shadow-lg transition-shadow cursor-pointer" onClick={startReviewSession}>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Spaced Review</h3>
            <p className="text-gray-600 mb-6">Study cards that are due for review</p>
            <Button className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white py-3 rounded-xl">
              Start Review Session
            </Button>
            <p className="text-sm text-gray-500 mt-3">{dueCards.length} cards due</p>
          </Card>

          {/* Study by Category Card */}
          <Card className="p-8 text-center light-shadow hover:light-shadow-lg transition-shadow cursor-pointer" onClick={showCategorySelection}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Study by Category</h3>
            <p className="text-gray-600 mb-6">Focus on specific topics and subjects</p>
            <Button 
              className="w-full bg-gradient-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white py-3 rounded-xl"
              disabled={categories.length === 0}
            >
              Browse Categories
            </Button>
            <p className="text-sm text-gray-500 mt-3">{categories.length} categories available</p>
          </Card>

          {/* Study All Cards */}
          <Card className="p-8 text-center light-shadow hover:light-shadow-lg transition-shadow cursor-pointer" onClick={startStudyAll}>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Study All Cards</h3>
            <p className="text-gray-600 mb-6">Review all flashcards in random order</p>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white py-3 rounded-xl"
              disabled={flashcards.length === 0}
            >
              Start Study Session
            </Button>
            <p className="text-sm text-gray-500 mt-3">{flashcards.length} total cards</p>
          </Card>
        </div>


      </div>
    </div>
  );
}