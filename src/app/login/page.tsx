'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If a user is already logged in, redirect them away from the login page.
  useEffect(() => {
    if (user) {
      // Redirect based on role if needed, or to a default page
      if (user.role === 'superadmin') {
        router.replace('/super-admin-dashboard');
      } else if (user.role === 'lv2admin') {
        router.replace('/lv2-admin-dashboard');
      } else if (user.role === 'scorekeeper') {
        router.replace('/scorekeeper-dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [user, router]);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      // The redirect is handled by the AuthContext and the effect above
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isAuthLoading || user) {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const isLoading = isSubmitting || isAuthLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <FormControl>
                        <Input
                          id="username"
                          placeholder="your_username"
                          disabled={isLoading}
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
                    <FormItem className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                                Forgot your password?
                            </Link>
                        </div>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                   {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
