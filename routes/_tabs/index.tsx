import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_tabs/')({
  component: Index,
});

function Index() {
  return <div className="p-8 text-center">Loading Civic Pulse Feed...</div>;
}
