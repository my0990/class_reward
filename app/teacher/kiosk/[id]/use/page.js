import ItemUseTemplate from "./components/ItemUseTemplate"

export default async function ItemUse({params}) {
    const {id} = await params
    return(
        <ItemUseTemplate classId={id}/>
    )
}