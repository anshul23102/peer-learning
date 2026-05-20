import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);
const { needsOnboarding } = useAuth();
const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }


}, []);

// ⏳ Loading
if (loading) {
return ( <div className="flex min-h-screen items-center justify-center"> <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /> </div>
);
}

// 🔐 Not logged in → redirect safely
if (!user) {
return <Navigate to="/login" replace />;
}

if (needsOnboarding && location.pathname !== "/onboarding") {
return <Navigate to="/onboarding" replace />;
}

return <>{children}</>;
};

export default ProtectedRoute;
