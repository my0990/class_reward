export default function CharacterCard(props) {
    return (
        <div {...props} className="w-[160px] h-[200px] p-[16px] m-[16px] bg-white">
            <h1 className="text-[1.2rem] font-bold">{props.user.userName}</h1>
        </div>
    )
}