"use client";

import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import { adminStyles } from "../admin-styles";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("We couldn't sign you in. Check your details and try again.");
        setIsSubmitting(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Admin access is temporarily unavailable. Try again shortly.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={adminStyles.loginForm} onSubmit={handleSubmit}>
      <label className={adminStyles.fieldLabel}>
        <span className={adminStyles.fieldLabelText}>Email address</span>
        <input
          className={adminStyles.loginInput}
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className={adminStyles.fieldLabel}>
        <span className={adminStyles.fieldLabelText}>Password</span>
        <div className={adminStyles.passwordField}>
          <input
            className={`${adminStyles.loginInput} pr-12`}
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type={isPasswordVisible ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            className={adminStyles.passwordToggle}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </label>
      <p aria-live="polite" className={adminStyles.formError}>
        {error}
      </p>
      <Button
        variant="navy"
        disabled={isSubmitting}
        isLoading={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
