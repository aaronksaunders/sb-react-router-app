/**
 * Registration route for user sign-up.
 *
 * This module handles user registration by processing form data,
 * validating input, and creating a new user session upon successful registration.
 *
 * @module register
 */

import { Form, Link, redirect, type MetaFunction } from "react-router";
import { Route } from "./+types/login";
import { getServerClient } from "~/server";

/**
 * Meta function for setting the page metadata.
 *
 * @returns {Array<{ title: string, name?: string, content?: string }>} Metadata for the page.
 */
export const meta: MetaFunction = () => {
	return [
		{ title: "New React Router Supabase App" },
		{
			name: "description",
			content: "Welcome to React Router with Supabase!",
		},
	];
};

/**
 * Loader function to check if the user is already logged in.
 *
 * @param {Route.LoaderArgs} args - The loader arguments containing the request.
 * @returns {Promise<{ user: null, error: null }>} An object indicating no user is logged in.
 */
export async function loader({ request }: Route.LoaderArgs) {
	// Check if the user is already logged in
	const sbServerClient = getServerClient(request);
	const userResponse = await sbServerClient.client.auth.getUser();
	if (userResponse?.data?.user) {
		throw redirect("/home", { headers: sbServerClient.headers });
	}

	return data({ user: null, error: null }, { headers: sbServerClient.headers });
}

/**
 * Handles the action for user registration.
 *
 * @param {Route.ActionArgs} args - The action arguments containing the request.
 * @returns {Promise<{ error?: string, user?: any }>} An object containing an error message if validation fails.
 */
export async function action({ request }: Route.ActionArgs) {
	try {
		const formData = await request.formData();
		const dataFields = Object.fromEntries(formData.entries());

		const sbServerClient = getServerClient(request);
		const { data, error } = await sbServerClient.client.auth.signUp({
			email: dataFields.email as string,
			password: dataFields.password as string,
			options: {
				data: {
					username: dataFields.username as string,
				},
			},
		});

		if (error) {
			return data(
				{ error: error.message },
				{ headers: sbServerClient.headers },
			);
		}

		return data({ user: data.user }, { headers: sbServerClient.headers });
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message };
		}

		return { error: "An unknown error occurred" };
	}
}

/**
 * Register route component.
 * This component allows new users to create an account.
 * It includes a registration form and handles user input validation.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.actionData - Data returned from the action function, including any error messages.
 * @returns {JSX.Element} The rendered registration form component.
 */
export default function Register({ actionData }: Route.ComponentProps) {
	const error = actionData
		? (actionData as { error: string | null })?.error
		: null;

	return (
		<div className="p-8 min-w-3/4 w-[500px] mx-auto">
			<h1 className="text-2xl">React Router v7 Supabase Auth: Register</h1>
			<Form method="post" className="mt-6 ">
				<div className="flex flex-col gap-2">
					<div className="flex flex-row">
						<label htmlFor="username" className="min-w-24 ">
							Username:
						</label>
						<input
							id="username"
							className="flex-1"
							type="text"
							name="username"
							placeholder="Enter your username"
						/>
					</div>
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
							Register User
						</button>
						<Link to="/login">
							<button
								type="button"
								className="border rounded px-2.5 py-1 w-32 border-blue-500 text-blue-500"
							>
								Go Back
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
