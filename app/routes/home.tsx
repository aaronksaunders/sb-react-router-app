import type { Route } from "./+types/home";
import { getServerClient } from "~/server";
import { Form, Link, redirect } from "react-router";

/**
 * Meta function for setting the page metadata.
 *
 * @param {Route.MetaArgs} args - The meta arguments containing the request.
 * @returns {Array<{ title: string, name?: string, content?: string }>} Metadata for the page.
 */
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home - New React Router Supabase App" },
    {
      name: "description",
      content: "Welcome to the home page of React Router with Supabase!",
    },
  ];
}

/**
 * Action function to handle logout.
 *
 * This function processes the logout request and redirects the user to the login page.
 *
 * @param {Route.ActionArgs} args - The action arguments containing the request.
 * @returns {Promise<Response>} A redirect response to the login page.
 */
export async function action({ request }: Route.ActionArgs) {
  try {
    const sbServerClient = getServerClient(request);
    await sbServerClient.auth.signOut();

    return redirect("/login");
  } catch (error) {
    console.error(error);
    return { error: "Failed to logout" };
  }
}

/**
 * Loader function to fetch user data.
 *
 * This function retrieves user information from the server and checks if the user is logged in.
 *
 * @param {Route.LoaderArgs} args - The loader arguments containing the request.
 * @returns {Promise<{ user: Object | null }>} An object containing user data or null if not logged in.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const sbServerClient = getServerClient(request);
  const userResponse = await sbServerClient.auth.getUser();
  if (userResponse.error || !userResponse.data.user) {
    throw redirect("/login");
  }

  return { user: userResponse?.data?.user || null };
}

/**
 * Home route component.
 * This component displays the home page of the application.
 * It may include user-specific content and navigation options.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.loaderData - Data returned from the loader function, including user information.
 * @param {Object} props.actionData - Data returned from the action function, including any error messages.
 * @returns {JSX.Element} The rendered home component.
 */
export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const user = loaderData?.user;
  const error = (actionData as { error: string | null })?.error;

  return (
    <div className="p-8 min-w-3/4 w-[500px] mx-auto">
      <h1 className="text-2xl">
        React Router Supabase App with Authentication
      </h1>
      <p className="text-lg mt-1">Welcome {user?.email}</p>
      <Form method="post">
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white p-2 rounded-md text-sm"
        >
          Logout
        </button>
      </Form>
      {error && <p className="text-red-500">{error}</p>}
      <hr className="my-4" />
      <div className="mt-4">
        <span className="text-sm">
          Continue with a CRUD application using React Router and Supabase.
        </span>
        <span className="text-sm ml-1 text-blue-500">
          <Link to="/crud">Go to CRUD Example</Link>
        </span>
      </div>
    </div>
  );
}
