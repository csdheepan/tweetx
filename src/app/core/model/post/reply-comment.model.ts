export class ReplyComments implements IReplyComments {
    profileImg!:string;
    name!:string;
    comment!:string;
    time!:string;
    date!:string;
    commentId!:string;

    constructor(data:Partial<IReplyComments>){
        this.profileImg = data.profileImg || ""
        this.name = data.name || ""
        this.comment = data.comment || ""
        this.time = data.time || ""
        this.date = data.date || ""
        this.commentId = data.commentId || ""
    }
}

export interface IReplyComments{
    profileImg :string;
    name :string;
    comment :string;
    time :string;
    date :string;
    commentId :string;
}