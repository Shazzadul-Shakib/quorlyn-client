import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/app";

  return (
    <Card>
      <CardBody className="space-y-6 p-6">
        <div className="space-y-1">
          <h1 className="text-fg text-xl font-semibold tracking-tight">
            Sign in to Quorlyn
          </h1>
          <p className="text-fg-muted text-sm">
            Teachers, students and administrators use the same sign-in.
          </p>
        </div>
        <LoginForm next={target} />
      </CardBody>
    </Card>
  );
}
