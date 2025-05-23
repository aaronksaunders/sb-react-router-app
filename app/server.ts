import { parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

export const getServerClient = (request: Request) => {
	const headers = new Headers();
	const supabase = createServerClient(
		process.env.SUPABASE_URL!,
		process.env.SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get("Cookie") ?? "") ?? {};
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						headers.append(
							"Set-Cookie",
							serializeCookieHeader(name, value, options),
						),
					);
				},
			},
		},
	);

	return { client: supabase, headers: headers };
};
