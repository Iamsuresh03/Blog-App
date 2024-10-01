import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage(){
    const[posts, setPosts] = useState([]);

    useEffect(()=>{
        fetch('https://myblog-rho-tan-22.vercel.app/post').then(response =>{
            response.json().then(posts=>{
                setPosts(posts);
            })
        })
    },[])
    return (
        <>
            {posts.length >0 && posts.map(post =>(
                <Post{...post}/>
            ))}
        </>
    );
}