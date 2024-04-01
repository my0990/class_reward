import AuthPage from "./components/auth/AuthPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect} from "next/navigation";
export default async function Home() {
  const session = await getServerSession(authOptions);

  if(session){
    redirect("/directory/dashboard")
  }
  return (
    <main>
        <AuthPage />
    </main>
  );
}
