import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route('visualizer/:id', './routes/visualize.&id.tsx')
] satisfies RouteConfig;
