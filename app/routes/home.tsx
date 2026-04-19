import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="home">
    <h1 className="text-3xl text-indigo-700">
      <span className="font-extrabold"> Home</span>
    </h1>
    </div>
  );
}
