import { JWTUser } from '../../user/types/JWTUser';

export type RequestData = {
  user: JWTUser;
  params: Record<string, string>;
};
