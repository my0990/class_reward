export default function DialBtn(props) {
    return (
        <li {...props} className={`shadow-[3px_3px_0px_1px_#808080a6] mb-[20px] rounded-3xl cursor-pointer ${props.color=== 'red' ? 'bg-red-300' : 'bg-orange-300'} w-[72px] h-[64px] m-[4px] text-[1.4rem] flex justify-center items-center`}>{props.children}</li>
    )
}