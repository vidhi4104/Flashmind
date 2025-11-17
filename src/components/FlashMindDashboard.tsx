import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Upload, 
  BookOpen, 
  Users, 
  Flame,
  Target,
  Trophy,
  Plus,
  Play,
  Clock,
  Award,
  Menu,
  X,
  Brain,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dashboard } from "./Dashboard";
import { UploadStudio } from "./UploadStudio";
import { StudyMode } from "./StudyMode";
import { Community } from "./Community";
import { Analytics } from "./Analytics";
import { FloatingParticles } from "./FloatingParticles";
import { RippleButton } from "./RippleButton";
import { useAuth } from "../contexts/AuthContext";
import flashMindLogo from 'figma:asset/adbf3fb0542b5220b78320b1c0579ae8a29f13e9.png';

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Upload, label: "Upload Studio" },
  { icon: BookOpen, label: "Study Mode" },
  { icon: Users, label: "Community" },
  { icon: Brain, label: "Analytics" },
];

export function FlashMindDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const progressItems = [
    { icon: Flame, label: "Study Streak", value: `${user?.stats?.studyStreak || 0} days`, color: "text-orange-500" },
    { icon: Target, label: "Total Cards", value: `${user?.stats?.totalCards || 0}`, color: "text-blue-500" },
    { icon: Trophy, label: "Level", value: `${user?.stats?.level || 1}`, color: "text-purple-500" },
  ];

  const handlePageTransition = (newPage: string) => {
    setIsPageLoading(true);
    setPageTransition(true);
    
    // Short delay to show the transition effect
    setTimeout(() => {
      setActivePage(newPage);
      setPageTransition(false);
      
      // Slight delay to allow content to render before removing loading
      setTimeout(() => {
        setIsPageLoading(false);
      }, 100);
    }, 300);
  };

  const renderNavItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <button
        key={item.label}
        onClick={() => {
          if (activePage !== item.label) {
            handlePageTransition(item.label);
          }
          setIsMobileSidebarOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-300 transform hover:scale-[1.02] ${
          isActive 
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-bold shadow-lg shadow-blue-100/50 border border-blue-200" 
            : "text-gray-600 font-bold hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md hover:shadow-gray-100/50"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-600"}`} />
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <FloatingParticles />
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16 flex items-center justify-between px-4 light-shadow">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src={flashMindLogo} 
              alt="FlashMind Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-light-primary text-lg">FlashMind</h1>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors light-shadow hover:light-shadow-lg"
          aria-label="Toggle navigation menu"
        >
          {isMobileSidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 flex flex-col transform transition-all duration-500 ease-out shadow-2xl md:shadow-lg md:bg-white
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50 light-shadow">
          <div className="flex items-center space-x-3 group">
            <div className="w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img 
                src={flashMindLogo} 
                alt="FlashMind Logo" 
                className="w-10 h-10 object-contain filter group-hover:drop-shadow-lg"
              />
            </div>
            <div className="transition-all duration-300">
              <h1 className="font-bold text-light-primary group-hover:text-light-cta transition-colors duration-300">FlashMind</h1>
              <p className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">AI Learning Assistant</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {/* Learning Hub */}
          <div className="space-y-2">
            <div className="px-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Learning Hub</h3>
            </div>
            <div className="space-y-1">
              {sidebarItems.map((item) => renderNavItem(item, activePage === item.label))}
            </div>
          </div>

          {/* Your Progress */}
          <div className="space-y-3">
            <div className="px-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Your Progress</h3>
            </div>
            <div className="space-y-2">
              {progressItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.label} 
                    className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gray-50/50 hover:transform hover:scale-105 cursor-pointer group light-shadow hover:light-shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-1 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                      item.color === 'text-orange-500' ? 'group-hover:bg-orange-50' :
                      item.color === 'text-blue-500' ? 'group-hover:bg-blue-50' :
                      'group-hover:bg-purple-50'
                    }`}>
                      <Icon className={`w-4 h-4 ${item.color} transition-all duration-300 group-hover:drop-shadow-sm`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-black group-hover:text-gray-700 transition-colors duration-300">{item.label}</p>
                      <p className="text-sm font-medium text-black transition-all duration-300 group-hover:font-semibold">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 light-shadow">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center light-shadow">
              <span className="text-purple-600 font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
        {/* Header - Only show on Dashboard */}
        {activePage === "Dashboard" && (
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6 animate-in fade-in-0 slide-in-from-top-4 duration-500 light-shadow">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-light-cta mb-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!
              </h1>
              <p className="text-sm md:text-base text-gray-600">Your AI-powered learning companion</p>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-hidden relative">
          {/* Loading Overlay */}
          {isPageLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          )}

          {/* Page Content with Transitions */}
          <div className={`transition-all duration-500 ease-in-out ${
            pageTransition 
              ? 'opacity-0 transform translate-y-4 scale-95' 
              : 'opacity-100 transform translate-y-0 scale-100'
          }`}>
            {activePage === "Dashboard" && (
              <Dashboard onNavigate={handlePageTransition} />
            )}
            
            {activePage === "Upload Studio" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <UploadStudio />
              </div>
            )}
            
            {activePage === "Study Mode" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <StudyMode />
              </div>
            )}
            
            {activePage === "Community" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <Community />
              </div>
            )}
            
            {activePage === "Analytics" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <Analytics />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}