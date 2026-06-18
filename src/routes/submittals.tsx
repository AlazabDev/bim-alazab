import { createFileRoute } from "@tanstack/react-router";
import { IssuesList } from "./issues";
export const Route = createFileRoute("/submittals")({
  head: () => ({ meta: [{ title: "المعتمدات — bim.alazab.com" }] }),
  component: () => <IssuesList kind="submittal" />,
});
