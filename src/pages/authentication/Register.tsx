import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/shared/LoginModal";
import { useGoogleLogin, useGithubLogin, useDiscordLogin } from "@/hooks/useAuth";
import Logo from "@/assets/img/Logo.png";

const Register: React.FC = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // TanStack Query mutations
  const googleLogin = useGoogleLogin();
  const githubLogin = useGithubLogin();
  const discordLogin = useDiscordLogin();

  // Helper function to redirect based on role
  const redirectByRole = (role: string) => {
    switch (role) {
      case 'admin':
        navigate("/admin/dashboard");
        break;
      case 'member':
        navigate("/member/dashboard");
        break;
      default:
        navigate("/");
        break;
    }
  };

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      redirectByRole(currentUser.role);
    }
  }, [currentUser, navigate]);

  const handleGoogleRegister = () => {
    googleLogin.mutate();
  };

  const handleGithubRegister = () => {
    githubLogin.mutate();
  };

  const handleDiscordRegister = () => {
    discordLogin.mutate();
  };

  // Get loading state from any active mutation
  const isLoading = googleLogin.isPending || githubLogin.isPending || discordLogin.isPending;

  return (
    <div className="flex min-h-screen">
      {/* Left Banner */}
      <div className="relative hidden w-1/2 flex-col justify-center bg-gradient-to-br from-red-600 to-red-800 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1536440136628-1c6cb5a2a869?w=1920&q=80&auto=format&fit=crop)`
          }}
        ></div>
        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold">Tham gia cùng chúng tôi</h2>
          <p className="text-xl opacity-90">
            Khám phá thế giới ẩm thực đầy màu sắc với hàng ngàn món ăn hấp dẫn
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center p-2">
              <img 
                src={Logo} 
                alt="Chicken Kitchen Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Đăng Ký</CardTitle>
            <CardDescription>
              Chọn một phương thức đăng ký để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Đăng ký với Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGithubRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                Đăng ký với GitHub
              </Button>

              <Button
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleDiscordRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
                  </svg>
                )}
                Đăng ký với Discord
              </Button>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Đã có tài khoản? </span>
                <button 
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="text-red-600 hover:underline"
                  disabled={isLoading}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
      />
    </div>
  );
};

export default Register;
