import { ReplyComments } from "./reply-comment.model";

export class Comments implements IComments{
    
    comment!:string;
    time !:string;
    profileImg !:string;
    senderId !:string;
    date !:string;
    name!:string;
    replyComments!:ReplyComments[];


    constructor(data:Partial<IComments>){
      this.comment = data.comment || '';
      this.time = data.time || '';
      this.profileImg = data.profileImg || '';
      this.senderId = data.senderId || '';
      this.date = data.date || '';
      this.name = data.name || '';
      this.replyComments = data.replyComments ? data.replyComments : [];
}
}

export interface IComments{
    comment :string;
    time :string;
    profileImg : string;
    senderId :string;
    date :string;
    name :string;
    replyComments :ReplyComments[];
}