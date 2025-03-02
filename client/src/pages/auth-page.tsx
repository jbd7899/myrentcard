import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Building2, Key } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to={user.type === 'tenant' ? '/tenant' : '/landlord'} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <Building2 className="mx-auto h-12 w-12 text-[#4361ee]" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Welcome to RentCard
            </h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your credentials to access your RentCard account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit((data) =>
                    loginMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#4361ee] hover:bg-[#3a0ca3] text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="flex items-center justify-center h-full text-white px-12">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Your Rental Journey Starts Here
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <Key className="h-6 w-6 mr-3" />
                  <span>Find your perfect rental home</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-6 w-6 mr-3" />
                  <span>Connect with quality tenants</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-6 w-6 mr-3" />
                  <span>Streamline your rental process</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}