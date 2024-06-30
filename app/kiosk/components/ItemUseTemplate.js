export default function ItemUseTemplate({setStep}){
    return(
        <div className="flex flex-col">
            item use template
            <button onClick={()=>setStep('home')}>처음으로</button>
        </div>
    )
}