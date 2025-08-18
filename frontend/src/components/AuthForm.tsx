"use client";

import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormType } from "@/types";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { signUp, signIn } from "@/lib/actions/auth.action";

/* ---------- validation schema ---------- */
const schema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });

/* ---------- component ---------- */
export default function AuthForm({ type }: { type: FormType }) {
  const router = useRouter();
  const form = useForm<z.infer<ReturnType<typeof schema>>>({
    resolver: zodResolver(schema(type)),
    defaultValues: { name: "", email: "", password: "" },
  });

  const isSignIn = type === "sign-in";

  /* ---------- submit ---------- */
  // In AuthForm component, update the sign-up branch:
async function onSubmit(data: z.infer<ReturnType<typeof schema>>) {
  try {
    if (isSignIn) {
      // Sign-in logic remains the same
      const { email, password } = data;
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await user.getIdToken();

      const res = await signIn({ email, idToken });
      if (!res.success) return toast.error(res.message);

      toast.success("Signed in successfully");
      window.location.href = "/";
    } else {
      // Fixed sign-up logic
      const { name, email, password } = data;
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document AND Firebase Auth user
      const res = await signUp({ uid: user.uid, name: name!, email, password });
      if (!res.success) return toast.error(res.message);

      toast.success("Account created. Please sign in.");
      router.push("/sign-in");
    }
  } catch (e: any) {
    toast.error(e.message ?? "Auth error");
  }
}


  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex items-center justify-center pattern space-bg animate-fadeIn">
      {/* glass card + border gradient */}
      <div className="card-border">
        <div className="dark-gradient rounded-2xl p-10 w-[90vw] max-w-md border border-white/15"> 
          <div className="flex flex-col items-center gap-5 mb-8">
            {/* <Image src="logo.svg" alt="logo" width={40} height={40} /> */}
            <h2 className="text-primary-100 font-bold text-2xl">KrishiSewa</h2>
            <h3 className="text-light-100">
              {isSignIn ? "Access your agricultural assistant" : "Practice farming with AI"}
            </h3>
          </div>

          {/* form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="form space-y-6">
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Your Name"
                  type="text"
                />
              )}

              <FormField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Your email address"
                type="email"
              />

              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />

              <Button
                disabled={form.formState.isSubmitting}
                className="btn h-12 w-full"
                type="submit"
              >
                {form.formState.isSubmitting
                  ? "Loading..."
                  : isSignIn
                  ? "Sign In"
                  : "Create an Account"}
              </Button>
            </form>
          </Form>

          {/* footer link */}
          <p className="mt-6 text-center text-light-100 text-sm">
            {isSignIn ? "No account yet?" : "Have an account already?"}{" "}
            <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="text-primary-200 font-bold">
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
