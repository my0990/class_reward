export default function AuthInput(props){
    return(
        <input {...props} placeholder={props.placeholder} className="input input-bordered w-full mb-4 dark:placeholder:text-white dark:bg-gray-600" />
    )
}