import { AxiosError } from "axios";
import { Request, Response } from "express";
import winston from "winston";
import { HttpError } from "../errors/http.error";
import { defaultErrors } from "../lib/error-handler";
import { QueryFailedError } from "typeorm";
type StringAble = string | number | object;
const LEVELS = [
  "emergency",
  "critical",
  "error",
  "warning",
  "notice",
  "http",
  "info",
  "debug",
] as const;

const levels = LEVELS.reduce((acc, level, idx) => {
  acc[level] = idx;
  return acc;
}, {} as Record<typeof LEVELS[number], number>);

const transports = [new winston.transports.Console()];

const colors: Record<typeof LEVELS[number], string> = {
  emergency: "bold red",
  critical: "italic red",
  error: "red",
  warning: "yellow",
  notice: "blue",
  http: "cyan",
  info: "green",
  debug: "magenta",
};

class Logger implements Record<typeof LEVELS[number], (...args: any) => void> {
  private base: winston.Logger;
  constructor() {
    winston.addColors(colors);
    const formats: winston.Logform.Format[] = [];
    // formats.push(winston.format.timestamp());
    formats.push(
      winston.format((info) => ({
        ...info,
        level: info.level.toUpperCase(),
      }))(),
    );
    if (process.env['NODE_ENV'] !== "production") {
      formats.push(winston.format.colorize({ all: true }));
    }
    formats.push(winston.format.printf(({ level, timestamp, message }) => {
      return `${timestamp || ""} [${level}] : ${message}`;
    }));
    this.base = winston.createLogger({
      level: "info",
      levels,
      format: winston.format.combine(...formats),
      transports,
      exitOnError: false,
    });
  }
  info = (...infos: StringAble[]) => this.base.log("info", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  debug = (...infos: StringAble[]) => this.base.log("debug", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  notice = (...infos: StringAble[]) => this.base.log("notice", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  warning = (...infos: StringAble[]) => this.base.log("warning", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  critical = (...infos: StringAble[]) => this.base.log("critical", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  emergency = (...infos: StringAble[]) => this.base.log("emergency", infos.map(c => c instanceof Object ? JSON.stringify(c) : c.toString()).join(" "));
  error(error: unknown) {
    switch (true) {
      case error instanceof AxiosError: {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          this.base.error(`Api Failed: ${error.config?.url}, details: ${JSON.stringify({ status: error.response.status, data: error.response.data, type: 'Axios Error (1)' })}`);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser 
          // and an instance of http.ClientRequest in node.js
          this.base.error(`Api Failed: ${error.config?.url}, details: ${JSON.stringify({ body: error.config?.data, type: 'Axios Error (2)' })}`);
        } else {
          // Something happened in setting up the request that triggered an Error
          this.base.error(`Api Failed: ${JSON.stringify({ error: error.message, type: 'Axios Error (3)' })}`);
        }
        break;
      }
      // case error instanceof S3ServiceException: {
      //   // @ts-ignore
      //   this.base.error(`S3 Error (${error.name}): ${JSON.stringify({ key: error.Key, status: error.$metadata.httpStatusCode, message: error.message, type: error.name })}`)
      //   break;
      // }
      case error instanceof HttpError: {
        this.base.error(`Http Error: ${JSON.stringify({ type: error.name, message: error.message, status: error.status })}`);
        break;
      }
      // @ts-ignore
      case defaultErrors.includes(error.constructor): {
        // @ts-ignore
        this.base.log("critical", `${error.constructor}: ${JSON.stringify({ message: error.message })} `);
        // @ts-ignore
        this.base.log("critical", `Stack: ${error.stack}`)
        break;
      }
      case error instanceof QueryFailedError: {
        // @ts-ignore
        this.base.error(`Database Query Failed: ${JSON.stringify({ code: error.code, detail: error.detail })} `);
        break;
      }
      case error instanceof Error: {
        this.base.error(`Normal Error: ${JSON.stringify({ type: error.name, message: error.message })}`);
        break;
      }
      case error instanceof String: {
        this.base.error(`String Error: ${JSON.stringify({ type: 'string', message: error })}`);
        break;
      }
      default: {
        this.base.error(`Unknown Error: ${error}`);
      }
    }
  }
  http = (req: Request, res: Response, time?: number) => this.base.http(`${req.method.toUpperCase()} --> ${req.url} --> ${res.status} --> ${time || -1} ms`);
}
const logger = new Logger();
export default logger;
