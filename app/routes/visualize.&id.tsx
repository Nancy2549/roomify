import {type RouteConfig, index, route} from "@react-router/dev/routes";
import type { Route } from "../+types/root";

export default [
    index("routes/home.tsx"),
    route('visualizer/:id','./routes/visualizer.$id.tsx')
] satisfies RouteConfig;
