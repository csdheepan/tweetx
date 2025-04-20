export class SignUp implements ISignUp {
    id: string;
    name: string;
    email: string;
    password: string;
    profileImg: string;
  
    constructor(data: Partial<ISignUp>) {
      this.id = data.id || '';
      this.name = data.name || '';
      this.email = data.email || '';
      this.password = data.password || '';
      this.profileImg = data.profileImg || 'assets/images/person.jpg';
    }    
  }

  export interface ISignUp {
    id: string;
    name: string;
    email: string;
    password: string;
    profileImg: string;
  }
  