import HeaderContainer from "../../../common/header/Header.container"
import DashboardFooter from "@/components/ui/common/DashboardFooter"
import TimerDoneWatcher from "@/components/timer/TimerDoneWatcher"

export default async function RootLayout({ children, params }) {
    const {id} = await params
    return (
        <div className="flex min-h-dvh flex-col">
            <HeaderContainer classId={id}/>
            {/* 다른 화면에 있는 동안 타이머가 끝나면 토스트 */}
            <TimerDoneWatcher classId={id} />
            <div className="flex-1">{children}</div>
            <DashboardFooter />
        </div>
    )
}