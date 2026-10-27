import { Suspense } from "react";
import Quest from "./Quest";

// Quest는 주소의 ?id=(퀘스트 상세)를 읽는다(useSearchParams) → Suspense로 감싼다
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Quest />
    </Suspense>
  );
}
