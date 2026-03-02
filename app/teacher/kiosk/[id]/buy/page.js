import ItemBuyTemplate from "./components/buy/ItemBuyTemplate"

export default async function ItemBuy({params}) {
    const {id} = await params;

    return(
        <ItemBuyTemplate classId={id}/>
    )
}