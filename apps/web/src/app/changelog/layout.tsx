import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Chronological release ledger and system evolution logs.",
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
