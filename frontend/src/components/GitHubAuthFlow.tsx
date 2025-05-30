import { useEffect, useState } from "react"
import { Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AuthStatus {
  authenticated: boolean;
  hasGitHubApp: boolean;
  user?: {
    username: string;
    avatarUrl?: string;
  };
}

export function GitHubAuthFlow({ onComplete }: { onComplete?: () => void }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the callback page with installation needed
    const url = new URL(window.location.href);
    const needsInstallation = url.searchParams.get('needsInstallation');

    if (needsInstallation === 'true') {
      // Open GitHub App installation page in a new tab
      const installUrl = `https://github.com/apps/aditracker/installations/new`;
      window.open(installUrl, '_blank');
      // After opening installation page, redirect to dashboard
      window.location.href = '/';
      return;
    }

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('https://vmi1968527.contaboserver.net/auth/status', {

      });
      const data = await response.json();

      if (data.authenticated) {
        // If authenticated, check GitHub App installation
        const installationResponse = await fetch('https://vmi1968527.contaboserver.net/auth/check-installation', {

        });
        const installationData = await installationResponse.json();

        setAuthStatus({
          authenticated: true,
          hasGitHubApp: installationData.hasGitHubApp,
          user: data.user
        });

        if (installationData.hasGitHubApp && onComplete) {
          onComplete();
        }
      } else {
        setAuthStatus({
          authenticated: false,
          hasGitHubApp: false
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = () => {
    window.open('https://github.com/apps/aditracker/installations/select_target', '_blank');
  };

  const handleInstallApp = () => {
    window.location.href = 'https://vmi1968527.contaboserver.net/auth/github/install';
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="lg" disabled className="gap-2 bg-background/80 backdrop-blur-sm border-primary/50">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-primary/90">Checking authentication...</span>
      </Button>
    );
  }

  if (!authStatus?.authenticated) {
    return (
      <Button
        onClick={handleGitHubAuth}
        size="lg"
        variant="outline"
        className="gap-3 bg-background/80 backdrop-blur-sm border-primary hover:bg-background/90 hover:border-primary/80 transition-all"
      >
        <Github className="h-5 w-5 text-primary" />
        <span className="text-primary font-medium">Connect with GitHub</span>
      </Button>
    );
  }

  if (!authStatus.hasGitHubApp) {
    return (
      <Button
        onClick={handleInstallApp}
        size="lg"
        variant="outline"
        className="gap-3 bg-background/80 backdrop-blur-sm border-primary hover:bg-background/90 hover:border-primary/80 transition-all"
      >
        <Github className="h-5 w-5 text-primary" />
        <span className="text-primary font-medium">Install GitHub App</span>
      </Button>
    );
  }

  return null;
}
