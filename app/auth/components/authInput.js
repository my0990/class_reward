export default function AuthInput(props){
    return(
        <input 
        autoComplete="off"
        autoCapitalize="none"
        spellCheck="false" 
        {...props} 
        placeholder={props.placeholder} 
        className="focus:border-orange-500 border-2 mb-[16px] input input-bordered w-full  dark:placeholder:text-white dark:bg-gray-600" />
    )
}