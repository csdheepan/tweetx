import { Comments } from "./comment.model";

export class UserPost implements IUserPost {
    content !: string;
    id !: string
    name !: string;
    time !: string;
    date !: string;
    postId !: string;
    comments !: Comments[];

    constructor(data:Partial<IUserPost>){
        this.content = data.content || "";
        this.id = data.id || "";
        this.time = data.time || "";
        this.date = data.date || "";
        this.postId = data.postId || "";
        this.comments = data.comments || [];
    }
}

export interface IUserPost{
    content : string;
    id : string
    name : string;
    time : string;
    date : string;
    postId : string;
    comments : Comments[];
}