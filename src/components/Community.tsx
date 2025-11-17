import { useState, useEffect } from "react";
import { 
  Search, 
  Download, 
  Star, 
  Users, 
  BookOpen, 
  Award,
  Share,
  Plus,
  Filter,
  ChevronDown,
  Eye,
  Heart,
  User
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";

interface CommunityDeck {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  rating: number;
  totalRatings: number;
  cardCount: number;
  downloads: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  featured?: boolean;
}

const sampleDecks: CommunityDeck[] = [
  {
    id: '1',
    title: 'Circuit Analysis Fundamentals',
    description: 'Essential electrical engineering concepts including Ohm\'s law, Kirchhoff\'s laws, and circuit analysis techniques.',
    category: 'Electrical Engineering',
    author: 'Prof. ElectroEng',
    rating: 4.9,
    totalRatings: 156,
    cardCount: 75,
    downloads: 1250,
    tags: ['circuits', 'ohms-law', 'kirchhoff', 'analysis'],
    difficulty: 'medium',
    createdAt: new Date('2024-01-15'),
    featured: true
  },
  {
    id: '2',
    title: 'Thermodynamics & Heat Transfer',
    description: 'Core mechanical engineering principles covering thermodynamic laws, heat transfer mechanisms, and energy systems.',
    category: 'Mechanical Engineering',
    author: 'Dr. MechPro',
    rating: 4.7,
    totalRatings: 189,
    cardCount: 92,
    downloads: 890,
    tags: ['thermodynamics', 'heat-transfer', 'energy', 'laws'],
    difficulty: 'hard',
    createdAt: new Date('2024-01-20'),
    featured: true
  },
  {
    id: '3',
    title: 'Structural Analysis & Design',
    description: 'Civil engineering fundamentals including beam analysis, load calculations, and structural design principles.',
    category: 'Civil Engineering',
    author: 'Eng. BuildPro',
    rating: 4.6,
    totalRatings: 124,
    cardCount: 68,
    downloads: 675,
    tags: ['structures', 'beams', 'loads', 'design'],
    difficulty: 'medium',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '4',
    title: 'Digital Logic & Computer Architecture',
    description: 'Computer engineering essentials covering logic gates, Boolean algebra, and processor design.',
    category: 'Computer Engineering',
    author: 'CompEng Master',
    rating: 4.8,
    totalRatings: 203,
    cardCount: 85,
    downloads: 1450,
    tags: ['digital-logic', 'boolean', 'architecture', 'processors'],
    difficulty: 'medium',
    createdAt: new Date('2024-01-25')
  },
  {
    id: '5',
    title: 'Chemical Process Engineering',
    description: 'Chemical engineering fundamentals including mass balance, reactor design, and separation processes.',
    category: 'Chemical Engineering',
    author: 'ChemEng Expert',
    rating: 4.5,
    totalRatings: 98,
    cardCount: 110,
    downloads: 420,
    tags: ['mass-balance', 'reactors', 'separation', 'processes'],
    difficulty: 'hard',
    createdAt: new Date('2024-01-18')
  },
  {
    id: '6',
    title: 'Fluid Mechanics & Aerodynamics',
    description: 'Aerospace engineering principles covering fluid flow, lift and drag forces, and flight mechanics.',
    category: 'Aerospace Engineering',
    author: 'Aero Engineer',
    rating: 4.4,
    totalRatings: 95,
    cardCount: 78,
    downloads: 560,
    tags: ['fluid-mechanics', 'aerodynamics', 'lift', 'drag'],
    difficulty: 'hard',
    createdAt: new Date('2024-01-12')
  },
  {
    id: '7',
    title: 'Environmental Impact Assessment',
    description: 'Environmental engineering concepts including pollution control, waste management, and sustainability.',
    category: 'Environmental Engineering',
    author: 'EnviroEng Pro',
    rating: 4.6,
    totalRatings: 142,
    cardCount: 64,
    downloads: 720,
    tags: ['pollution', 'waste-management', 'sustainability', 'assessment'],
    difficulty: 'medium',
    createdAt: new Date('2024-01-22')
  },
  {
    id: '8',
    title: 'Operations Research & Optimization',
    description: 'Industrial engineering methods including linear programming, queuing theory, and process optimization.',
    category: 'Industrial Engineering',
    author: 'IndEng Specialist',
    rating: 4.3,
    totalRatings: 87,
    cardCount: 56,
    downloads: 380,
    tags: ['optimization', 'linear-programming', 'queuing', 'operations'],
    difficulty: 'hard',
    createdAt: new Date('2024-01-14')
  },
  {
    id: '9',
    title: 'Materials Science & Properties',
    description: 'Engineering materials fundamentals covering crystal structures, mechanical properties, and material selection.',
    category: 'Materials Engineering',
    author: 'Materials Prof',
    rating: 4.7,
    totalRatings: 165,
    cardCount: 82,
    downloads: 945,
    tags: ['materials', 'crystals', 'properties', 'selection'],
    difficulty: 'medium',
    createdAt: new Date('2024-01-08')
  }
];

const categories = [
  'All Categories',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Environmental Engineering',
  'Industrial Engineering',
  'Materials Engineering'
];

export function Community() {
  const [decks, setDecks] = useState<CommunityDeck[]>(sampleDecks);
  const [filteredDecks, setFilteredDecks] = useState<CommunityDeck[]>(sampleDecks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [newDeck, setNewDeck] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  });

  // Stats calculations
  const totalDecks = decks.length;
  const totalDownloads = decks.reduce((sum, deck) => sum + deck.downloads, 0);
  const uniqueCategories = new Set(decks.map(deck => deck.category)).size;
  const avgRating = decks.reduce((sum, deck) => sum + deck.rating, 0) / decks.length;

  // Filter decks based on search and category
  useEffect(() => {
    let filtered = decks;

    if (searchQuery) {
      filtered = filtered.filter(deck =>
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        deck.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(deck => deck.category === selectedCategory);
    }

    setFilteredDecks(filtered);
  }, [searchQuery, selectedCategory, decks]);

  const handleDownload = (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      // Create sample flashcards for the deck
      const sampleCards = Array.from({ length: deck.cardCount }, (_, i) => ({
        id: `card_${i + 1}`,
        front: `Question ${i + 1} for ${deck.title}`,
        back: `Answer ${i + 1} - This is a sample answer for the ${deck.category.toLowerCase()} topic.`,
        category: deck.category,
        difficulty: deck.difficulty,
        tags: deck.tags
      }));

      // Create deck data with metadata and cards
      const deckData = {
        metadata: {
          id: deck.id,
          title: deck.title,
          description: deck.description,
          category: deck.category,
          author: deck.author,
          rating: deck.rating,
          totalRatings: deck.totalRatings,
          difficulty: deck.difficulty,
          tags: deck.tags,
          downloadedAt: new Date().toISOString(),
          version: "1.0"
        },
        cards: sampleCards,
        statistics: {
          totalCards: deck.cardCount,
          estimatedStudyTime: `${Math.ceil(deck.cardCount * 2)} minutes`
        }
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(deckData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}_flashcards.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update download count
      setDecks(prev => prev.map(d => 
        d.id === deckId ? { ...d, downloads: d.downloads + 1 } : d
      ));
      
      toast.success(`Downloaded "${deck.title}" successfully! Check your downloads folder.`);
    }
  };

  const handleShareDeck = () => {
    if (!newDeck.title || !newDeck.description || !newDeck.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    const deck: CommunityDeck = {
      id: Date.now().toString(),
      title: newDeck.title,
      description: newDeck.description,
      category: newDeck.category,
      author: 'You',
      rating: 0,
      totalRatings: 0,
      cardCount: 0,
      downloads: 0,
      tags: newDeck.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      difficulty: 'medium',
      createdAt: new Date()
    };

    setDecks(prev => [deck, ...prev]);
    setNewDeck({ title: '', description: '', category: '', tags: '' });
    setIsShareDialogOpen(false);
    toast.success("Deck shared successfully!");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-light-cta mb-2">Community Decks</h1>
            <p className="text-sm md:text-base text-gray-600">Discover and share flashcard decks with the community</p>
          </div>
          
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center gap-2 text-sm md:text-base w-full md:w-auto">
                <Share className="w-4 md:w-5 h-4 md:h-5" />
                <span className="hidden sm:inline">Share Deck</span>
                <span className="sm:hidden">Share</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Your Deck</DialogTitle>
                <DialogDescription>
                  Fill in the details below to share your flashcard deck with the community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Deck Title</Label>
                  <Input
                    id="title"
                    value={newDeck.title}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter deck title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDeck.description}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your deck"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newDeck.category} onValueChange={(value) => setNewDeck(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newDeck.tags}
                    onChange={(e) => setNewDeck(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="javascript, programming, basics"
                  />
                </div>
                <Button onClick={handleShareDeck} className="w-full">
                  Share Deck
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 light-shadow"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-6 text-center light-shadow hover:light-shadow-lg shadow-lg shadow-blue-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-blue-200/30 hover:scale-105 hover:border-blue-300/50 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Users className="w-6 h-6 text-blue-600 transition-all duration-300 group-hover:text-blue-700" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-105">{totalDecks}</div>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Shared Decks</p>
          </Card>
          
          <Card className="p-6 text-center light-shadow hover:light-shadow-lg shadow-lg shadow-green-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-green-200/30 hover:scale-105 hover:border-green-300/50 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Download className="w-6 h-6 text-green-600 transition-all duration-300 group-hover:text-green-700" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-green-700 group-hover:scale-105">{totalDownloads.toLocaleString()}</div>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Total Downloads</p>
          </Card>
          
          <Card className="p-6 text-center light-shadow hover:light-shadow-lg shadow-lg shadow-purple-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-purple-200/30 hover:scale-105 hover:border-purple-300/50 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BookOpen className="w-6 h-6 text-purple-600 transition-all duration-300 group-hover:text-purple-700" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-purple-700 group-hover:scale-105">{uniqueCategories}</div>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Categories</p>
          </Card>
          
          <Card className="p-6 text-center light-shadow hover:light-shadow-lg shadow-lg shadow-orange-100/20 transition-all duration-500 hover:shadow-xl hover:shadow-orange-200/30 hover:scale-105 hover:border-orange-300/50 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Award className="w-6 h-6 text-orange-600 transition-all duration-300 group-hover:text-orange-700" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:text-orange-700 group-hover:scale-105">{avgRating.toFixed(1)}</div>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Avg Rating</p>
          </Card>
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredDecks.map((deck) => (
            <Card key={deck.id} className="p-6 light-shadow hover:light-shadow-lg transition-all duration-200">
              {deck.featured && (
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Featured
                </Badge>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{deck.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {deck.category}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deck.description}</p>
              
              <div className="flex items-center gap-1 mb-4">
                {renderStars(deck.rating)}
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {deck.rating > 0 ? deck.rating.toFixed(1) : 'New'}
                </span>
                {deck.totalRatings > 0 && (
                  <span className="text-sm text-gray-500">({deck.totalRatings})</span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {deck.author}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {deck.cardCount} cards
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {deck.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {deck.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{deck.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(deck.difficulty)}>
                    {deck.difficulty}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {deck.downloads} downloads
                  </span>
                </div>
              </div>
              
              {/* Download Section */}
              <div className="border-t border-gray-200 pt-4">
                <Button 
                  onClick={() => handleDownload(deck.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:scale-[1.02] light-shadow hover:light-shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Deck
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredDecks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No decks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}