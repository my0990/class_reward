import Header from "../components/common/header"
export default function RootLayout({children}){
    return(
        <div>
            <Header />
            {children}
        </div>
    )
}