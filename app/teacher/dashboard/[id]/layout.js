import HeaderContainer from "@/app/_layout/header/Header.container";

export default async function RootLayout({ children, params }) {
    const {id} = await params
    return (
        <div>
            <HeaderContainer classId={id}/>
            {children}
        </div>
    )
}