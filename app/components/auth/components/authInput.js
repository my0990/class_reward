export default function AuthInput(props){
    return(
        <input {...props} type="text" placeholder={props.placeholder} className="input input-bordered w-full mb-4" />
    )
}