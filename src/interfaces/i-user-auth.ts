import type { Me } from "@/@types/me";

interface IUserAuth {
  user?: Me;
  accessToken: string;
}

export default IUserAuth;
