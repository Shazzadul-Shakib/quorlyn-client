import { redirect } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { buildNavSections } from "@/features/shell/nav";
import { ShellChrome } from "@/features/shell/components/shell-chrome";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const me = await getMe();

  // Nothing to act in: send to the picker/join flow. A pure platform admin
  // with no memberships has nothing to pick, so they go straight in.
  if (!me.org && me.user.platformRole !== "SUPERADMIN") {
    redirect("/select-organization");
  }

  const sections = buildNavSections(me.user, me.org);

  return (
    <ShellChrome user={me.user} org={me.org} memberships={me.memberships} sections={sections}>
      {children}
    </ShellChrome>
  );
}
