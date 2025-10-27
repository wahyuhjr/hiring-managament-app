"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Image from "next/image";

export function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Simple validation
    const newErrors = {};
    if (!formData.email) newErrors.email = "Alamat email wajib diisi";
    if (!formData.password) newErrors.password = "Kata sandi wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali!",
      });
      router.push("/admin/jobs");
      router.refresh();
    } else {
      toast({
        title: "Gagal masuk",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo-rakamin.svg"
            width={200}
            height={50}
            alt="logo rakamin"
          />
        </div>

        {/* Card Container */}
        <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Masuk ke Rakamin
            </h1>
            <p className="text-gray-600 text-sm">
              Belum punya akun?{" "}
              <a
                href="/auth/register"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Daftar menggunakan email
              </a>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 text-sm">
              <Label
                htmlFor="email"
                className="text-sm font-normal text-gray-700 "
              >
                Alamat email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`h-14 text-base border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-normal text-gray-700"
              >
                Kata sandi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-14 text-base border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 pr-12 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="/auth/forgot-password"
                className="text-cyan-600 hover:text-cyan-700 text-base"
              >
                Lupa kata sandi?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-base rounded-lg shadow-sm"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Masuk
            </Button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900 font-medium text-base rounded-lg"
              >
                <Mail className="mr-3 h-5 w-5 text-gray-600" />
                Kirim link login melalui email
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900 font-medium text-base rounded-lg"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
