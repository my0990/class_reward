import ManageTemplate from "./components/ManageTemplate"

export default function StudentManage() {
    let data = [
        { userName: '이명권', userId: 'mu0990' },
        { userName: '이재철', userId: 't0990' }
    ]
    return (
        <div>
            <ManageTemplate data={data}/>
        </div>
    )
}