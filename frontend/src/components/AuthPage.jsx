// src/components/AuthPage.jsx — Login / Signup page with animated toggle
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const fadeSlide = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
};

function AuthPage({ onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!form.name.trim()) throw new Error("Name is required");
        await signup(form.name.trim(), form.email.trim(), form.password);
      } else {
        await login(form.email.trim(), form.password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
  };

  return (
    <section className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Decorative glow */}
        <div className="auth-card__glow" />

        {/* Toggle pills */}
        <div className="auth-toggle">
          <button
            className={`auth-toggle__btn ${mode === "login" ? "auth-toggle__btn--active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
            type="button"
            id="auth-toggle-login"
          >
            Log in
          </button>
          <button
            className={`auth-toggle__btn ${mode === "signup" ? "auth-toggle__btn--active" : ""}`}
            onClick={() => { setMode("signup"); setError(""); }}
            type="button"
            id="auth-toggle-signup"
          >
            Sign up
          </button>
          <motion.div
            className="auth-toggle__indicator"
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ left: mode === "login" ? "4px" : "50%" }}
          />
        </div>

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div key={mode} {...fadeSlide} className="auth-card__header">
            <h2 className="auth-card__title">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="auth-card__subtitle">
              {mode === "login"
                ? "Sign in to track your applications"
                : "Start tracking internships in seconds"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" id="auth-form">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="auth-name">
                    Full name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    className="auth-field__input"
                    placeholder="Yash Khetan"
                    value={form.name}
                    onChange={update("name")}
                    autoComplete="name"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              className="auth-field__input"
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              className="auth-field__input"
              placeholder="••••••••"
              value={form.password}
              onChange={update("password")}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="auth-error__icon">!</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
            id="auth-submit-btn"
          >
            {submitting ? (
              <span className="auth-submit__spinner" />
            ) : mode === "login" ? (
              "Sign in →"
            ) : (
              "Create account →"
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <p className="auth-card__footer">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="auth-card__switch"
            onClick={toggleMode}
            id="auth-switch-mode"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </section>
  );
}

export default AuthPage;
