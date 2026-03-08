import DashboardContainer from "./_dashboard/_Dashboard.container";

export default async function Page({params}) {
    const { id } = await params;
    return(
        <DashboardContainer classId={id}/>
    )
}