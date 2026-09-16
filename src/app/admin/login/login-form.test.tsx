import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { replace, refresh, signInWithPassword } = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
  signInWithPassword: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signInWithPassword },
  }),
}));

import { AdminLoginForm } from "./login-form";

describe("admin login form", () => {
  beforeEach(() => {
    replace.mockReset();
    refresh.mockReset();
    signInWithPassword.mockReset();
  });

  it("signs in and navigates to the dashboard", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "correct horse battery staple" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "admin@example.com",
        password: "correct horse battery staple",
      });
      expect(replace).toHaveBeenCalledWith("/admin");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows a generic error when authentication fails", async () => {
    signInWithPassword.mockResolvedValue({ error: new Error("invalid") });
    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText(
        "We couldn't sign you in. Check your details and try again.",
      ),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows and hides the password when toggled", () => {
    render(<AdminLoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    const showPasswordButton = screen.getByRole("button", {
      name: "Show password",
    });

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(showPasswordButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(showPasswordButton);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Show password" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
