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

	async handle(event: IFXEvent) {
		const eventName = event.key;
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

		return await handler(event);
	}

	async serve() {
		const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
			if (req.url === "/" && req.method === "POST") {
				try {
					const event = await this.parseJSON(req);
					const response = await this.handle(event);
					return this.sendJSON(res, 200, response);
				} catch (error: any) {
					return this.sendJSON(res, 400, { error: error.toString() });
				}
			}

			return this.sendJSON(res, 404, { error: "Send POST requests to '/'" });
		});

		const port = process.env.PORT || this.getPortFromName();
		server.listen(port, () => {
			const address = server.address() as AddressInfo;

			logger.debug(`Dev server is running at http://localhost:${address.port}`);
		});
	}

	private getPortFromName(minPort = 50000, maxPort = 65535): number {
		// Create a simple hash from the string
		const hash = this.def.integrationName.split("").reduce((acc, char) => {
			return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
		}, 0);

		// Convert hash to a port number within the valid range
		const port = (Math.abs(hash) % (maxPort - minPort)) + minPort;
		return port;
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
