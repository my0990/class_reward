export default function AuthBtn(props){
    return(
        <button {...props} className={`btn btn-block bg-orange-500 dark:hover:bg-orange-300  mb-4 text-lg ${props.className} border-0 text-white`}>{props.children}</button>
    )
}