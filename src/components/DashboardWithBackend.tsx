import { useState, useEffect } from "react";
import { Target, BarChart3, Trophy, Clock, Plus, Play, Award, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { RippleButton } from "./RippleButton";
import { useAuth } from "../contexts/AuthContext";
import { deckAPI, studyAPI } from "../utils/api";
import { toast } from "sonner";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function DashboardWithBackend({ onNavigate }: DashboardProps) {
  const { user, refreshUser } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user's decks
      const decksResponse = await deckAPI.getAll();
      if (decksResponse.success) {
        setDecks(decksResponse.decks || []);
      }

      // Load due cards
      const dueResponse = await studyAPI.getDueCards();
      if (dueResponse.success) {
        setDueCards(dueResponse.cards || []);
      }

      // Refresh user data to get latest stats
      await refreshUser();
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = user?.stats || {
    streak: 0,
    total_cards: 0,
    level: 1,
    total_decks: 0,
    cards_studied_today: 0,
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 overflow-auto h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 overflow-auto h-full animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-lg shadow-blue-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/30 hover:scale-105 hover:border-blue-300/50 group cursor-pointer animate-in fade-in-0 slide-in-from-left-4 duration-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Target className="w-5 h-5 text-blue-600 transition-all duration-300 group-hover:text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-black group-hover:text-gray-700 transition-colors duration-300">Total Cards</p>
              </div>
            </div>
            <p className="text-3xl transition-all duration-300 group-hover:text-blue-700 group-hover:scale-105">{stats.total_cards}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-lg shadow-purple-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-purple-200/30 hover:scale-105 hover:border-purple-300/50 group cursor-pointer animate-in fade-in-0 slide-in-from-left-4 duration-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <BookOpen className="w-5 h-5 text-purple-600 transition-all duration-300 group-hover:text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-black group-hover:text-gray-700 transition-colors duration-300">Total Decks</p>
              </div>
            </div>
            <p className="text-3xl transition-all duration-300 group-hover:text-purple-700 group-hover:scale-105">{stats.total_decks}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-lg shadow-green-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-green-200/30 hover:scale-105 hover:border-green-300/50 group cursor-pointer animate-in fade-in-0 slide-in-from-left-4 duration-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Trophy className="w-5 h-5 text-green-600 transition-all duration-300 group-hover:text-green-700" />
              </div>
              <div>
                <p className="text-sm text-black group-hover:text-gray-700 transition-colors duration-300">Studied Today</p>
              </div>
            </div>
            <p className="text-3xl transition-all duration-300 group-hover:text-green-700 group-hover:scale-105">{stats.cards_studied_today}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-lg shadow-orange-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-orange-200/30 hover:scale-105 hover:border-orange-300/50 group cursor-pointer animate-in fade-in-0 slide-in-from-left-4 duration-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Clock className="w-5 h-5 text-orange-600 transition-all duration-300 group-hover:text-orange-700" />
              </div>
              <div>
                <p className="text-sm text-black group-hover:text-gray-700 transition-colors duration-300">Cards to Review</p>
              </div>
            </div>
            <p className="text-3xl transition-all duration-300 group-hover:text-orange-700 group-hover:scale-105">{dueCards.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
            {/* Your Progress */}
            <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl p-6 border border-gray-200/50 shadow-lg shadow-gray-100/30 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/40 hover:scale-[1.02]">
              <div className="flex items-center space-x-2 mb-6 group">
                <div className="p-1 rounded-lg transition-all duration-300 group-hover:bg-purple-50">
                  <Trophy className="w-5 h-5 text-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700" />
                </div>
                <h2 className="text-lg transition-colors duration-300 group-hover:text-purple-700">Your Progress</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Award className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">Study Streak</p>
                  </div>
                  <p className="text-2xl">{stats.streak} {stats.streak === 1 ? 'day' : 'days'}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600">Total Cards</p>
                  </div>
                  <p className="text-2xl">{stats.total_cards}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Trophy className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">Level</p>
                  </div>
                  <p className="text-2xl">{stats.level}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress to Level {stats.level + 1}</span>
                  <span className="text-gray-900">{Math.min(stats.total_cards * 10, 100)}%</span>
                </div>
                <Progress value={Math.min(stats.total_cards * 10, 100)} className="h-2" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <h2 className="text-lg mb-6">Quick Actions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RippleButton
                  onClick={() => onNavigate('Upload Studio')}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Create New Deck</span>
                </RippleButton>

                <Button
                  onClick={() => onNavigate('Study Mode')}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg group"
                  disabled={dueCards.length === 0}
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Study Now</span>
                </Button>

                <Button
                  onClick={() => onNavigate('Community')}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Browse Community</span>
                </Button>

                <Button
                  onClick={() => onNavigate('Analytics')}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>View Analytics</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8 animate-in fade-in-0 slide-in-from-right-6 duration-700">
            {/* Recent Decks */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-lg mb-4">Recent Decks</h2>

              {decks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No decks yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first deck to get started</p>
                  <Button
                    onClick={() => onNavigate('Upload Studio')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deck
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {decks.slice(0, 5).map((deck, index) => (
                    <div
                      key={deck.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm mb-1 group-hover:text-blue-700 transition-colors">{deck.title}</h3>
                          <p className="text-xs text-gray-500">{deck.card_count || 0} cards</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNavigate('Study Mode')}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Study
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Study Reminder */}
            {dueCards.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <h3 className="text-orange-900">Study Reminder</h3>
                </div>
                <p className="text-sm text-orange-800 mb-4">
                  You have {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} ready for review
                </p>
                <Button
                  onClick={() => onNavigate('Study Mode')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Start Reviewing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
