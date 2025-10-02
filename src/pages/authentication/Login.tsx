import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import Logo from "@/assets/img/Logo.png";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chỉ là UI demo - không có logic xử lý
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Form */}
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
            <CardTitle className="text-2xl">Đăng Nhập</CardTitle>
            <CardDescription>
              Đăng nhập để trải nghiệm dịch vụ tốt nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a href="/forgot-password" className="text-sm text-red-600 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Đăng nhập
              </Button>

              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Chưa có tài khoản? </span>
                <a href="/register" className="text-red-600 hover:underline">
                  Đăng ký ngay
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Banner */}
      <div className="relative hidden w-1/2 flex-col justify-center bg-gradient-to-br from-red-600 to-red-800 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url()`
          }}
        ></div>
        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold">Chào mừng trở lại</h2>
          <p className="text-xl opacity-90">
            Trải nghiệm những món ăn ngon tuyệt vời tại nhà hàng hiện đại của chúng tôi
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
