import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { ArrowRight, HelpCircle, Leaf } from "lucide-react";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setUser(response.data.data.user);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuide = () => {
    navigate("/guide");
  };

  return (
    <main className="min-h-screen bg-[#F4F6F2] lg:flex">

      <section className="relative hidden min-h-screen overflow-hidden bg-[#18211D] lg:flex lg:w-[45%]">

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#315C4B]" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border-[60px] border-[#315C4B]/30" />

        <div className="absolute right-20 top-1/2 h-16 w-16 rounded-full border-8 border-[#8A2638]/40" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#315C4B]">
              <Leaf size={23} className="text-white" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">TaskFlow</h2>

              <p className="text-xs text-[#AAB6B0]">
                Plan · Collaborate · Achieve
              </p>
            </div>
          </div>

          <div className="max-w-lg">
            <div className="mb-7 h-1 w-12 bg-[#8A2638]" />

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white xl:text-6xl">
              Work better.
              <br />
              <span className="text-[#BFD8C7]">Move forward.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-[#AAB6B0]">
              Bring your projects, tasks, and team together in one focused
              workspace.
            </p>

            <div className="mt-10 space-y-5">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#70A982]" />

                <span className="text-sm text-[#D0D8D4]">
                  Organize projects and tasks
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#70A982]" />

                <span className="text-sm text-[#D0D8D4]">
                  Collaborate with your team
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#8A2638]" />

                <span className="text-sm text-[#D0D8D4]">
                  Work smarter with AI
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#68746E]">
            © 2026 TaskFlow · Built for teams
          </p>
        </div>
      </section>

      <section className="relative flex min-h-screen flex-1 items-center justify-center px-6 py-12 sm:px-10">

        <button
          type="button"
          onClick={handleGuide}
          className="absolute right-6 top-6 flex items-center gap-2 rounded-lg bg-[#8A2638] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#721F2F] sm:right-10 sm:top-8"
        >
          <HelpCircle size={17} />
          <span>Guide</span>
        </button>

        <div className="w-full max-w-[430px]">

          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#315C4B]">
              <Leaf size={20} className="text-white" />
            </div>

            <span className="text-xl font-semibold text-[#18211D]">
              TaskFlow
            </span>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A2638]">
              Get started
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#18211D] sm:text-4xl">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#68746E]">
              Start organizing your team's work with TaskFlow.
            </p>
          </div>

          {error && (
            <div className="mb-6 border-l-4 border-[#A85F5B] bg-[#F8ECEB] px-4 py-3 text-sm text-[#8D4D49]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#18211D]"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="h-12 w-full rounded-lg border border-[#D6DDD8] bg-white px-4 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#315C4B]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#18211D]"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="h-12 w-full rounded-lg border border-[#D6DDD8] bg-white px-4 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#315C4B]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#18211D]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                minLength={8}
                maxLength={128}
                required
                className="h-12 w-full rounded-lg border border-[#D6DDD8] bg-white px-4 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#315C4B]/10"
              />

              <p className="mt-2 text-xs text-[#89938E]">
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-5 text-sm font-semibold text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:bg-[#A9BEB0]"
            >
              {loading ? "Creating account..." : "Create account"}

              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-7 text-sm text-[#68746E]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#8A2638] hover:text-[#721F2F]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
