import { type IncomingMessage, type ServerResponse, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { type IFXEvent, logger } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";

export class DevCommand extends IFXCommand {
	handlers: Record<string, any> = {};
	router: Record<string, string[]> = {};

	async execute() {
		this.handlers = await this.eventsHandlers();
		this.router = this.eventsRouter();

		await this.serve();
	}

	async handle(eventName: string, data: any) {
		let handler = (...args: any[]) => {
			throw new Error("Handler not found");
		};

		const handlerName = Object.keys(this.router).find(
			(eventHandler) => this.router[eventHandler].includes(eventName) && Object.hasOwn(this.handlers, eventHandler),
		);

		if (handlerName) {
			handler = this.handlers[handlerName];
		} else if (Object.hasOwn(this.handlers, "defaultHandler")) {
			handler = this.handlers.defaultHandler;
		}

		return await handler(data);
	}

	async serve() {
		const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
			if (req.url === "/" && req.method === "POST") {
				try {
					const data = await this.parseJSON(req);
					const response = await this.handle(data.key, data.body);
					return this.sendJSON(res, 200, response);
				} catch (error: any) {
					return this.sendJSON(res, 400, { error: error.toString() });
				}
			}

			return this.sendJSON(res, 404, { error: "Send POST requests to '/'" });
		});

		server.listen(process.env.PORT || 0, () => {
			const address = server.address() as AddressInfo;

			logger.debug(`Dev server is running at http://localhost:${address.port}`);
		});
	}

	sendJSON(res: ServerResponse, status: number, body: any) {
		res.writeHead(status, { "Content-Type": "application/json" });
		res.end(JSON.stringify(body));
	}

	async parseJSON<T = IFXEvent>(req: IncomingMessage): Promise<T> {
		return new Promise((resolve, reject) => {
			let body = "";
			req.on("data", (chunk) => {
				body += chunk.toString();
			});
			req.on("end", () => {
				try {
					resolve(JSON.parse(body));
				} catch (error) {
					reject(new Error("Invalid JSON"));
				}
			});
		});
	}
}
