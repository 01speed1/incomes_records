// Silent route to handle Chrome DevTools automatic requests
export function loader() {
  // Return empty JSON response to satisfy Chrome DevTools
  return Response.json({}, { status: 200 });
}

export default function DevToolsSilent() {
  // This component will never render as loader returns JSON
  return null;
}
