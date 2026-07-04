import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import MemberDetail from '@/pages/MemberDetail';
import Clubs from '@/pages/Clubs';
import ClubDetail from '@/pages/ClubDetail';
import Competitions from '@/pages/Competitions';
import CompetitionDetail from '@/pages/CompetitionDetail';
import CompetitionWizard from '@/pages/CompetitionWizard';
import Results from '@/pages/Results';
import Weapons from '@/pages/Weapons';
import Licensing from '@/pages/Licensing';
import Users from '@/pages/Users';
import Templates from '@/pages/Templates';
import Doracak from '@/pages/Doracak';
import Finance from '@/pages/Finance';
import Pitch from '@/pages/Pitch';
import Prezantim from '@/pages/Prezantim';
import Suppliers from '@/pages/Suppliers';
import FundSources from '@/pages/FundSources';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetail />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/competitions/new" element={<CompetitionWizard />} />
        <Route path="/competitions/:id" element={<CompetitionDetail />} />
        <Route path="/results" element={<Results />} />
        <Route path="/weapons" element={<Weapons />} />
        <Route path="/licensing" element={<Licensing />} />
        <Route path="/users" element={<Users />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/fund-sources" element={<FundSources />} />
        <Route path="/doracak" element={<Doracak />} />
        <Route path="/prezantim" element={<Prezantim />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<AuthenticatedApp />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Routes>
          <Route path="/pitch" element={<Pitch />} />
          <Route path="*" element={
            <AuthProvider>
              <AppRouter />
              <Toaster />
            </AuthProvider>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App