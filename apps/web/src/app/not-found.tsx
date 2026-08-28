import type { Metadata } from "next";
import { NotFoundView } from "@/components/not-found";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The requested resource could not be found.",
};

export default function NotFound() {
  return <NotFoundView />;
}
