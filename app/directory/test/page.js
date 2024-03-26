
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/app/lib/database";
export default async function Home() {

  // Get user session token
  const session = await getServerSession(authOptions);
  // session = null || { user: { name, email, image } }
  const client = await connectDB;
  const db = client.db("test")
  
  let result = await db.collection('test').find().toArray();

  return (
    <div>
      <h2>My Amazing App</h2>
    <form type="GET" action="/api/signup">
        <input placeholder="이름을 입력하세요"></input>
        <input></input>
        <button>test</button>
    </form>
      {/* {session && (
        <div>
          <p>Signed in as {session.user && session.user.name}</p>
          <a href="/api/auth/signout">Sign out by link</a>
        </div>
      )}

      {!session && (
        <p>Not signed in</p>
      )} */}

    </div>
  );
}