import { AuthenticationService } from "./services/authentication-service";
import { PostServices } from "./services/post-service";
import { UserService } from "./services/user-service";

export const CORE_SERVICES_PROVIDERS: any[] = [

  AuthenticationService,PostServices,UserService
  // Add other services here

];
