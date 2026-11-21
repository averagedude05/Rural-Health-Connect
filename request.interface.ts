import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { AuthUser } from "./auth-user.interface";

export interface IRequest extends Request {
  headers: IncomingHttpHeaders;
  request_id?: string;
  start_at: number;
  user?: AuthUser;
}
