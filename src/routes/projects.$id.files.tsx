import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/projects/$id/files")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/projects/$id", params: { id: params.id }, search: { tab: "files" } });
  },
});
