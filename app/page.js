import AuthPage from "./components/auth/AuthPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect} from "next/navigation";
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session)
  if(session){
    redirect("/directory/home")
  }
  return (
    <main>
        <AuthPage />
    </main>
  );
}
