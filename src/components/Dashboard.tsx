import { useEffect, useState } from 'react';
import { Plus, Play, Clock, Award, TrendingUp, BookOpen, Zap } from 'lucide-react';
import { RippleButton } from './RippleButton';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { deckAPI, cardAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<any[]>([]);
  const [recentCards, setRecentCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const decksResponse = await deckAPI.getAll();
      
      if (decksResponse.success) {
        setDecks(decksResponse.decks || []);
        
        // Load recent cards from first deck
        if (decksResponse.decks && decksResponse.decks.length > 0) {
          const cardsResponse = await cardAPI.getForDeck(decksResponse.decks[0].deckId);
          if (cardsResponse.success) {
            setRecentCards((cardsResponse.cards || []).slice(0, 3));
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalDecks: user?.stats?.totalDecks || 0,
    totalCards: user?.stats?.totalCards || 0,
    studyStreak: user?.stats?.studyStreak || 0,
    level: user?.stats?.level || 1,
  };

  return (
    <div className="p-4 md:p-8 overflow-auto h-full animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="border-blue-200/50 shadow-lg shadow-blue-100/20 hover:shadow-xl hover:shadow-blue-200/30 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
              </div>
              <CardTitle className="text-3xl">{stats.totalDecks}</CardTitle>
              <CardDescription>Total Decks</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200/50 shadow-lg shadow-purple-100/20 hover:shadow-xl hover:shadow-purple-200/30 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Zap className="w-5 h-5 text-purple-600" />
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">Growing</Badge>
              </div>
              <CardTitle className="text-3xl">{stats.totalCards}</CardTitle>
              <CardDescription>Flashcards</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-200/50 shadow-lg shadow-orange-100/20 hover:shadow-xl hover:shadow-orange-200/30 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">🔥 Hot</Badge>
              </div>
              <CardTitle className="text-3xl">{stats.studyStreak}</CardTitle>
              <CardDescription>Day Streak</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200/50 shadow-lg shadow-green-100/20 hover:shadow-xl hover:shadow-green-200/30 hover:scale-105 transition-all duration-300 group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-700">Rising</Badge>
              </div>
              <CardTitle className="text-3xl">{stats.level}</CardTitle>
              <CardDescription>Current Level</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <RippleButton
                  onClick={() => onNavigate('Upload Studio')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Create New Deck</p>
                        <p className="text-xs text-blue-100">Upload files or create manually</p>
                      </div>
                    </div>
                  </div>
                </RippleButton>

                <RippleButton
                  onClick={() => onNavigate('Study Mode')}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Play className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Start Studying</p>
                        <p className="text-xs text-purple-100">Review your flashcards</p>
                      </div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">
                      {stats.totalCards} cards
                    </Badge>
                  </div>
                </RippleButton>

                <RippleButton
                  onClick={() => onNavigate('Community')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Browse Community</p>
                        <p className="text-xs text-green-100">Discover shared decks</p>
                      </div>
                    </div>
                  </div>
                </RippleButton>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : decks.length > 0 ? (
                  <div className="space-y-4">
                    {decks.slice(0, 3).map((deck, index) => (
                      <div
                        key={deck.deckId}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:shadow-md cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">{deck.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{deck.cardCount || 0} cards</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {deck.category || 'general'}
                          </Badge>
                        </div>
                        <Progress value={65} className="h-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs mt-1">Create a deck to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Study Schedule */}
        <div className="mt-6 md:mt-8">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Today's Study Plan</CardTitle>
              <CardDescription>Recommended cards to review</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalCards === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg mb-2">No cards yet</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Create your first deck to start your learning journey!
                  </p>
                  <Button
                    onClick={() => onNavigate('Upload Studio')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Deck
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-red-700">Due Now</span>
                      <Badge className="bg-red-600 text-white">Urgent</Badge>
                    </div>
                    <p className="text-3xl text-red-900">0</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-yellow-700">Due Today</span>
                      <Badge className="bg-yellow-600 text-white">Soon</Badge>
                    </div>
                    <p className="text-3xl text-yellow-900">0</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">Learned</span>
                      <Badge className="bg-green-600 text-white">Done</Badge>
                    </div>
                    <p className="text-3xl text-green-900">{stats.totalCards}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
