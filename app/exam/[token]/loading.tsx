import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/page";

export default function ExamLinkLoading() {
  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-11 w-full" />
      </CardBody>
    </Card>
  );
}
