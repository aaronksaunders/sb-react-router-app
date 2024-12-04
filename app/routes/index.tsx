import type { Route } from "./+types/index";
import { MetaFunction, redirect } from "react-router";
import { getServerClient } from "~/server";

/**
 * Meta function for setting the page metadata.
 *
 * @returns {Array<{ title: string, name?: string, content?: string }>} Metadata for the page.
 */
export const meta: MetaFunction = () => {
  return [
    { title: "New React Router Supabase App" },
    { name: "description", content: "Welcome to React Router with Supabase!" },
  ];
};

/**
 * Loader function to check if the user is logged in and redirect to home if so.
 * Otherwise, redirect to login.
 *
 * @param {Route.LoaderArgs} args - The loader arguments containing the request.
 * @returns {Promise<void>} Redirects to home if the user is logged in.
 */
export async function loader({ request }: Route.LoaderArgs) {
  try {
    const sbServerClient = getServerClient(request);
    const userResponse = await sbServerClient.auth.getUser();

    if (!userResponse?.data?.user) {
      throw redirect("/login");
    } else {
      throw redirect("/home");
    }
  } catch (error) {
    console.error(error);
    throw redirect("/login");
  }
}
