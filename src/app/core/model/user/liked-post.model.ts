export class LikedPost implements ILikedPost{
    name!:string;
    id!:string;
    postId!:string;
    liked!:boolean;

    constructor(data:Partial<ILikedPost>){
      this.name = data.name || "";
      this.id = data.id || "";
      this.postId = data.postId || "";
      this.liked = data.liked || false
    }
}

export interface ILikedPost{
    name:string;
    id:string;
    postId:string;
    liked:boolean;
}