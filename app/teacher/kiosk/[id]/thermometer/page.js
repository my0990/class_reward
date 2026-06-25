import ThermometerTemplate from "./components/ThermometerTemplate"

export default async function Page({params}) {
    const {id} = await params
    return(
        <ThermometerTemplate classId={id}/>
    )
}