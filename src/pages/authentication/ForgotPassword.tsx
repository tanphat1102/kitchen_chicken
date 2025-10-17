import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import Logo from "@/assets/img/Logo.png";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Banner */}
      <div className="relative hidden w-1/2 flex-col justify-center bg-gradient-to-br from-red-600 to-red-800 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1920&q=80&auto=format&fit=crop)`
          }}
        ></div>
        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold">Quên mật khẩu?</h2>
          <p className="text-xl opacity-90">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <img src={Logo} alt="Logo" className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">
              {success ? "Kiểm tra email của bạn" : "Quên mật khẩu"}
            </CardTitle>
            <CardDescription>
              {success 
                ? "Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn" 
                : "Nhập email để nhận liên kết đặt lại mật khẩu"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Nếu bạn không thấy email trong hộp thư đến, vui lòng kiểm tra thư mục spam.
                </div>
                <Button 
                  onClick={() => navigate("/login")}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

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
                      disabled={loading}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                  </Button>

                  <div className="text-center">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="text-sm text-red-600 hover:text-red-700"
                      onClick={() => navigate("/login")}
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đăng nhập
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
