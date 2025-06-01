import { Route, RouteProps } from "wouter";

// For mock data demonstration purposes, we're bypassing real authentication
export function ProtectedRoute({
  path,
  component,
}: RouteProps) {
  // In a mock data scenario, we'll always render the component
  // without checking authentication
  return <Route path={path} component={component} />;
}
