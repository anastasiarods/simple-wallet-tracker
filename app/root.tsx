import {
  LiveReload,
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  Meta,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import stylesUrl from "~/styles/index.css";
import tremorUrl from "@tremor/react/dist/esm/tremor.css";
import styles from "./tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: stylesUrl },
    { rel: "stylesheet", href: tremorUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "My Amazing App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
