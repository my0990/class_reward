import DashboardContainer from "./_dashboard/_Dashboard.container.jsx"

export default async function Page({params}) {
    const { id } = await params;
    return(
        <DashboardContainer classId={id}/>
    )
}