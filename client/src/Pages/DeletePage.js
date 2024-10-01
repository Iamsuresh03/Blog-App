import { useEffect, useState} from "react";
import { Navigate,useParams } from "react-router-dom";

export default function DeletePage(){
    const [redirect, setRedirect] = useState(false);
    const {id} = useParams();
    useEffect(()=>{
        const response =  fetch('http://localhost:4000/delete/'+id, {
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
            credentials:'include'
        }).then(response =>{
            if(response.status === 200){
                setRedirect(true);
            }
        })
        
    })
    
    if(redirect){
        return <Navigate to={'/'}/>
    }

    return(
        <div>This post was deleted!</div>
    );
}