export class Login implements ILogin {
    passcode !: string;
    userName !: string;

    constructor(data:Required<ILogin>){
        this.passcode = data.passcode || '';
        this.userName = data.userName || '';
    }
}

export interface ILogin {
    passcode : string;
    userName : string;
}