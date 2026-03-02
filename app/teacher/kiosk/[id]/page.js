
import KioskTemplate from "./common/KioskTemplate"




export default async function Kiosk({params}) {
    const {id} = await params;
    console.log(id)

    return (
        <div>
            <KioskTemplate classId={id}/>
        </div>
    )
}