import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { JoinForm } from "@/features/auth/components/join-form";

export const metadata: Metadata = { title: "Join with a code" };

export default async function JoinPage(props: PageProps<"/join">) {
  const { code } = await props.searchParams;

  return (
    <Card>
      <CardBody className="space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-fg text-xl font-semibold tracking-tight">
            Join your organization
          </h1>
          <p className="text-fg-muted text-sm">
            Students join with the code their school shared. You can belong to
            several organizations with one account.
          </p>
        </div>
        <JoinForm defaultCode={typeof code === "string" ? code : ""} />
      </CardBody>
    </Card>
  );
}
