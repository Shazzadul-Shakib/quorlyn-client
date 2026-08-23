import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/page";
import { IconSearch } from "@/components/ui/icons";

export default function AppNotFound() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <EmptyState
        icon={<IconSearch />}
        title="Not found"
        description="This page doesn't exist, or you don't have access to it."
        action={<ButtonLink href="/app">Back to home</ButtonLink>}
      />
    </div>
  );
}
