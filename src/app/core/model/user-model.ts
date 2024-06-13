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

export class Users{
    name !: string;
    profileImg !: string
    id !: string;
    status !: number;
}

export class UserPost{
    content !: string;
    id !: string
    name !: string;
    time !: string;
}