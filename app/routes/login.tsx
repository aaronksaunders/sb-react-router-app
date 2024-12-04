/**
 * Login route for user authentication.
 *
 * This module provides a login form for users to authenticate their accounts.
 * It handles form submission, user authentication, and redirects upon successful login.
 *
 * @module login
 */

import { Form, Link, redirect, type MetaFunction } from "react-router";
import { Route } from "./+types/login";
import { getServerClient } from "~/server";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

/**
 * Meta function for setting the page metadata.
 *
 * @returns {Array<{ title: string, name?: string, content?: string }>} Metadata for the page.
 */
export const meta: MetaFunction = () => {
  return [
    { title: "Login - New React Router Supabase App" },
    {
      name: "description",
      content: "Login to your account in React Router with Supabase!",
    },
  ];
};

/**
 * Loader function to check if the user is already logged in.
 *
 * @param {Route.LoaderArgs} args - The loader arguments containing the request.
 * @returns {Promise<void>} Redirects to home if the user is logged in.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const sbServerClient = getServerClient(request);
  const userResponse = await sbServerClient.auth.getUser();

  if (userResponse?.data?.user) {
    throw redirect("/home");
  }

  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    },
  };
}

/**
 * Handles the action for user login.
 *
 * @param {Route.ActionArgs} args - The action arguments containing the request.
 * @returns {Promise<{ error?: string }>} An object containing an error message if authentication fails.
 */
export async function action({ request }: Route.ActionArgs) {
  let response: Response;
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Invalid form data" };
    }

    const sbServerClient = getServerClient(request);
    const signInResponse = await sbServerClient.auth.signInWithPassword({
      email: email as string,
      password: password as string,
    });

    if (signInResponse.data.user) {
      return redirect("/home");
    }

    if ("error" in signInResponse) {
      return { error: signInResponse.error?.message as string };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message as string };
    }

    return { error: "An unknown error occurred" };
  }
}

/**
 * Login route component.
 * This component provides a form for users to log in to their accounts.
 * It handles authentication and redirects upon successful login.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.loaderData - Data returned from the loader function.
 * @returns {JSX.Element} The rendered login form component.
 */
export default function Login({ loaderData }: Route.ComponentProps) {
  const [error, setError] = useState<string | null>(null);
  const { env } = loaderData;

  const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const dataFields = Object.fromEntries(formData.entries());

    const supabase = createBrowserClient(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dataFields.email as string,
      password: dataFields.password as string,
    });

    if (error) {
      console.log(error);
      setError(error.message);
      return;
    }

    if (data.session) {
      console.log(data.session);
      redirect("/home");
    }
  };

  return (
    <div className="p-8 min-w-3/4 w-[500px] mx-auto">
      <h1 className="text-2xl">React Router v7 Supabase Auth: Login</h1>
      <Form method="post" className="mt-6 " onSubmit={doLogin}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row">
            <label htmlFor="email" className="min-w-24 ">
              Email:
            </label>
            <input
              id="email"
              className="flex-1"
              type="email"
              name="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex flex-row">
            <label htmlFor="password" className="min-w-24 ">
              Password:
            </label>
            <input
              id="password"
              className="flex-1"
              type="password"
              name="password"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex flex-row-reverse mt-4 gap-4">
            <button
              type="submit"
              className="border rounded px-2.5 py-1 w-32 bg-blue-500 text-white"
            >
              Login
            </button>
            <Link to="/register">
              <button
                type="button"
                className="border rounded px-2.5 py-1 w-32 border-blue-500 text-blue-500"
              >
                Register
              </button>
            </Link>
          </div>
          {error ? (
            <div className="flex flex-row">
              <p className="text-red-600 mt-4 ">{error}</p>
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
}
