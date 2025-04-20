export class Chats implements IChats {
    
    content !: string;
    senderId !: string;
    receiverId !: string;
    timestamp !: string;
    date !: string;
    status !: string;

    constructor(data:Partial<IChats>){
       this.content = data.content || '';
       this.senderId = data.senderId || '';
       this.receiverId = data.receiverId || '';
       this.timestamp = data.timestamp || '';
       this.date = data.date || '';
       this.status = data.status || '';
    }
}

export interface IChats{

    content : string;
    senderId : string;
    receiverId : string;
    timestamp : string;
    date : string;
    status : string;

}