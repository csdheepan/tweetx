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

export class UserStatus{
    name !: string;
    profileImg !: string
    id !: string;
    status !: string;
}