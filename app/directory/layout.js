import Header from "./components/header/header"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { connectDB } from "@/app/lib/database";
import RecoilRootProvider from "@/util/recoilRootProvider";
import Layout from "@/util/Layout";
export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    let response = null;
    if (session) {
        const db = (await connectDB).db('data');
        response = await db.collection('user_data').findOne({ userId: session.user.userId })
    }


    // const db = (await connectDB).db('data');
    // const response = await db.collection('user_data').findOne({ userId: session.user.userId })
    // if (!response) {
    //     console.log('user denied')
    //     signOut({ callbackUrl: '/' });
    //     return <div>
    //                 <div>user denied</div>
    //                 <div><SignoutBtn /></div>
    //             </div>

    // }
    // response._id = response._id.toString();
    // const currencyName = response.classData?.currencyName
    // const currencyEmoji = response.classData?.currencyEmoji
    return (
        <div className="dark:text-black flex flex-col h-screen">
            <RecoilRootProvider>
                <Layout fetchedUserData={response} fetchedSessionData={session} >
                    <Header session={session.user} />
                    {children}
                    <SpeedInsights />
                </Layout>
            </RecoilRootProvider>
        </div>
    )
}