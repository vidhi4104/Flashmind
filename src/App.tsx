import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FlashMindDashboard } from "./components/FlashMindDashboard";
import { Auth } from "./components/Auth";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { isAuthenticated, isLoading, login, signup } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading FlashMind...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={login} onSignup={signup} />;
  }

  return <FlashMindDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}