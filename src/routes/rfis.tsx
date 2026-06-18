import { createFileRoute } from "@tanstack/react-router";
import { IssuesList } from "./issues";
export const Route = createFileRoute("/rfis")({
  head: () => ({ meta: [{ title: "طلبات المعلومات — bim.alazab.com" }] }),
  component: () => <IssuesList kind="rfi" />,
});
