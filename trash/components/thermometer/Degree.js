export default function Degree({degree, temp}){
    return(
        <div className="absolute right-[100px] w-max flex items-center opacity-50 hover:opacity-100 cursor-default" style={{bottom: degree +2 + 'px'}}>{temp * 10}도</div>
    )
}