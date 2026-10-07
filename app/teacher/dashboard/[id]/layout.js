import HeaderContainer from "../../../common/header/Header.container"
import DashboardFooter from "@/components/ui/common/DashboardFooter"

export default async function RootLayout({ children, params }) {
    const {id} = await params
    return (
        <div className="flex min-h-dvh flex-col">
            <HeaderContainer classId={id}/>
            <div className="flex-1">{children}</div>
            <DashboardFooter />
        </div>
    )
}