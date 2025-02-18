import { FullPageLoader } from "@/components/layout/full-page-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { LoginFormSchema } from "@/schema/login-form-schema";
import { UserContext } from "@/utils/auth/UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { FrappeError } from "frappe-react-sdk";
import { AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import FormInput from "../common/form-input";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [loginError, setLoginError] = useState<FrappeError | null>(null);
  const { currentUser, login, isLoading } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (values: z.infer<typeof LoginFormSchema>) => {
    setLoginError(null);
    return login(values.email, values.password).catch((error) => {
      setLoginError(error);
    });
  };

  if (isLoading) {
    return <FullPageLoader />;
  } else if (currentUser) {
    return <Navigate to={`/`} replace />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login to SprintSpace</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name="email"
                type="email"
                label="Email"
                placeholder="me@sprintspace.com"
              />
              <div className="relative">
                <FormInput
                  control={form.control}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="●●●●●●●●●●●●"
                />
                <div
                  onClick={toggleShowPassword}
                  className="cursor-pointer absolute inset-y-0 top-8 right-0 flex items-center pr-3 text-slate-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Login
              </Button>
              <div className="text-center text-sm">
                <a
                  href="#"
                  className="inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
            </form>
          </Form>
          {loginError && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm mt-4 flex items-center gap-2"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 inline-block" />
              <p>Error: {loginError?.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
