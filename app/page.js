import AuthPage from "./components/auth/AuthPage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect} from "next/navigation";
import { connectDB } from "./lib/database";
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log('session')
  const db = (await connectDB).db('data')
  // const response = await db.collection('student').findOne({userId: 'mu0990'})
  if(session){
    redirect("/directory/dashboard")
  }
  return (
    <main>
        <AuthPage />
    </main>
  );
}
