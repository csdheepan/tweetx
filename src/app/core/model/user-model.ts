export class SignUp {
    id !: string;
    email !: string;
    password !: string;
    name !: string;
    profileImg !: string
}

export class Login {
    passcode !: string;
    userName !: string;
}

export class Users {
    name !: string;
    profileImg !: string
    id !: string;
    status !: number;
}

export class UserPost {
    content !: string;
    id !: string
    name !: string;
    time !: string;
    date !: string;
    postId !: string;
    comments !: Comments[]
}

export class UserProfile {
    name !: string;
    profileImg !: string
    id !: string;
}

export class Chats {
    content !: string;
    senderId !: string;
    receiverId !: string;
    timestamp !: string;
    date !: string;
    status !: string;
}

export class Message {
    name !: string;
    profileImg !: string;
    receiverId!: string;
    chat !: Chats;
}

export class Comments{
    comment!:string;
    time !:string;
    profileImg !:string;
    senderId !:string;
    date !:string;
    name!:string;
    replyComments!:ReplyComments[];
}

export class LikedPost{
    name!:string;
    id!:string;
    postId!:string;
    liked!:boolean;
}

export class ReplyComments{
    profileImg!:string;
    name!:string;
    comment!:string;
    time!:string;
    date!:string;
    commentId!:string;
}