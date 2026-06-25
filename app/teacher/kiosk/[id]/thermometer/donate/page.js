import DonateTemplate from "./components/DonateTemplate";

export default async function Page({params}){
    const {id} = await params
    return(
        <DonateTemplate classId={id}/>
    )
}