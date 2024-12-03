/**
 * Route configuration for the application.
 * This file defines the routing structure using React Router.
 * It includes the index route and other application routes.
 * 
 * @type {RouteConfig[]} - An array of route configurations.
 * @default
 */
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route("/home", "routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/register", "routes/register.tsx"),
    route("/crud", "routes/crud.tsx"),
] satisfies RouteConfig;
