import CharacterCard from "./CharacterCard"

export default function CharacterPick(props){
    console.log(props.studentData)
    const onClick = (a) => {
        props.setRequestData(prev => ({...prev, requestUserId: a.userId}))
    }
    return(
        <div className="flex flex-wrap">
            {props.studentData.map((a,i)=>{
                return(
                    <CharacterCard key={i} onClick={e => onClick(a)} user={a}/>
                )
            })}
        </div>
    )
}