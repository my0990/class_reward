export default function AuthBtn(props){
    return(
        <button {...props} className={`btn btn-block bg-orange-500 mb-4 text-lg ${props.className} `}>{props.children}</button>
    )
}