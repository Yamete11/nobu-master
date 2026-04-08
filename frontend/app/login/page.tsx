"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(4, "Password must contain at least 4 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    void values;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.08),transparent_45%)]" />
      <div className="relative w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-900/85 text-zinc-100 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">Nobu Time & Schedule</p>
            <CardTitle className="text-2xl font-semibold tracking-tight">Sign In</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in to access the restaurant manager dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="manager@nobu.com"
                          autoComplete="email"
                          className="border-zinc-700 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="border-zinc-700 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-center text-sm text-zinc-500">
              Demo mode without a real backend.{" "}
              <Link href="/" className="text-zinc-300 underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
