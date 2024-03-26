import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/app/lib/database";
import { compare } from "bcryptjs";


export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_SECRET_ID,
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_SECRET_ID,
    // }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const {id, password} = credentials;

        const db = (await connectDB).db('user');


        // 기존의 가입된 아이디 체크하기
        const user = await db.collection('users').findOne({ id: id });
        if(!user){
          return null
        } 
        const isCorrectPassword = await compare(
            password,
            user.password
        )
        if (!isCorrectPassword) {
          return null;
        }


        // If no error and we have user data, return it
        console.log('nextauth')
        console.log(user)
        // Return null if user data could not be retrieved
        return user;
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 //30일
  },

  callbacks: {
    jwt: async ({ token, user }) => {

      if (user) {
        token.user = {};
        token.user.name = user.name
        token.user.id = user.id
        token.user.role = user.role
        token.user.teacher = user.teacher
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;  
      return session;
    },

  },

  pages:{
    signIn: '/',
    error: '/'
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };