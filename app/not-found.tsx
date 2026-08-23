import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { IconSearch } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Not found" };

export default function RootNotFound() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center px-6 py-5">
        <Brand href="/" />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-6">
        <EmptyState
          icon={<IconSearch />}
          title="Not found"
          description="This page doesn't exist, or the link has expired."
          action={<ButtonLink href="/">Back home</ButtonLink>}
        />
      </main>
    </div>
  );
}
