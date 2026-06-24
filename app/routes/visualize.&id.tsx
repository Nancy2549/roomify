import type { Route } from "../+types/root";

export default function Visualize({ params }: Route.ComponentProps) {
  return (
    <div>
      <h1>Visualizer {"params.id"}</h1>
    </div>
  );
}

