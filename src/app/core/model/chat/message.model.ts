import { Chats } from "./chat.model";

export class Message implements IMessage {
    name !: string;
    profileImg !: string;
    receiverId!: string;
    chat !: Chats;

    constructor(data: Partial<IMessage>) {
        this.name = data.name || "";
        this.profileImg = data.profileImg || '';
        this.receiverId = data.receiverId || '';
        this.chat = data.chat ? new Chats(data.chat) : new Chats({});
    }
}

export interface IMessage {
    name: string;
    profileImg: string;
    receiverId: string;
    chat: Chats;
}