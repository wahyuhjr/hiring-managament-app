"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2, Mail, AlertTriangle, X } from "lucide-react";
import Image from "next/image";

export function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTooltip, setShowTooltip] = useState(false);

  const { register, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.username) newErrors.username = "Username wajib diisi";
    if (!formData.email) newErrors.email = "Alamat email wajib diisi";
    if (!formData.password) newErrors.password = "Kata sandi wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await register(formData.email, formData.password, formData.username);
      
      toast({
        title: "Berhasil mendaftar",
        description: "Silakan cek email Anda untuk konfirmasi akun!",
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      toast({
        title: "Gagal mendaftar",
        description: error.message || "Terjadi kesalahan saat mendaftar",
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
        <div className="mb-8">
          <Image
            src="/logo-rakamin.svg"
            width={200}
            height={50}
            alt="logo rakamin"
          />
        </div>

        <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Daftar ke Rakamin
            </h1>
            <p className="text-gray-600 text-sm">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Masuk menggunakan email
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-sm">
              <Label
                htmlFor="username"
                className="text-sm font-normal text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                className={`h-14 text-base border-2 rounded-lg transition-colors focus:outline-none ${
                  errors.username
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 hover:border-cyan-700 focus:border-cyan-500"
                }`}
              />
              {errors.username && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">{errors.username}</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="relative">
                <Label
                  htmlFor="email"
                  className="text-sm font-normal text-gray-700"
                >
                  Alamat email
                </Label>
                
                {showTooltip && (
                  <div className="absolute left-24 -top-2 z-10 bg-gray-800 text-white px-4 py-3 rounded-lg text-xs w-96">
                    <button
                      type="button"
                      onClick={() => setShowTooltip(false)}
                      className="absolute top-2 right-2 text-white hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="pr-2">
                      Fitur login dengan kata sandi akan dihapus.Pastikan email mu{" "}
                      <span className="font-semibold">valid</span> untuk{" "}
                      <span className="font-semibold">login melalui email atau Google</span>
                    </p>
                    <div className="absolute top-3 -left-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-gray-800"></div>
                  </div>
                )}
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setShowTooltip(true)}
                className={`h-14 text-base border-2 rounded-lg transition-colors focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 hover:border-cyan-700 focus:border-cyan-500"
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">{errors.email}</p>
                </div>
              )}
            </div>

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
                  className={`h-14 text-base border-2 rounded-lg pr-12 transition-colors focus:outline-none ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 hover:border-cyan-700 focus:border-cyan-500"
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
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <p className="text-sm">{errors.password}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-base rounded-lg shadow-sm"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Daftar
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
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
                Daftar dengan Google
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
