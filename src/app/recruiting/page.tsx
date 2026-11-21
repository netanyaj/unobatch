import { Suspense } from "react";
import RecruitingView from "@/components/RecruitingView";

export default function RecruitingPage() {
  return (
    <Suspense>
      <RecruitingView />
    </Suspense>
  );
}
