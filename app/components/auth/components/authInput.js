export default function AuthInput(props){
    return(
        <input {...props} placeholder={props.placeholder} className="focus:border-orange-500 border-2 input input-bordered w-full mb-4 dark:placeholder:text-white dark:bg-gray-600" />
    )
}