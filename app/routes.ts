import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("goals/new", "routes/goals.new.tsx"),
  route("goals/:goalId", "routes/goals.$goalId.tsx"),
  route("goals/:goalId/edit", "routes/goals.$goalId.edit.tsx"),
] satisfies RouteConfig;
