import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/assets/img/Logo.png";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return "Vui lòng nhập họ và tên";
    }
    if (!formData.email.trim()) {
      return "Vui lòng nhập email";
    }
    if (!formData.password) {
      return "Vui lòng nhập mật khẩu";
    }
    if (formData.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        displayName: formData.fullName
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.loginWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    console.log("Form data:", formData);
  };

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
              Tạo tài khoản mới để trải nghiệm dịch vụ tốt nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Họ và tên
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Ngày sinh
                  </label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pr-10"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleRegister}
                disabled={loading}
              >
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
                {loading ? "Đang xử lý..." : "Đăng ký với Google"}
              </Button>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Đã có tài khoản? </span>
                <button 
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-red-600 hover:underline"
                  disabled={loading}
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
