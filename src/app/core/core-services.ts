import { AuthenticationServices } from "./services/login.service";
import { PostServices } from "./services/post.services";
import { UserService } from "./services/user.service";

export const CORE_SERVICES_PROVIDERS: any[] = [

    AuthenticationServices,PostServices,UserService
  // Add other services here

];
