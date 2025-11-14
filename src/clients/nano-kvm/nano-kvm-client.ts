import type { BodyInit } from "bun";
import type z from "zod";
import { encryptPassword } from "@/encryption";
import { logger } from "@/logger";
import {
	type AuthLoginSchema,
	NanoKVMClientOptions,
} from "./nano-kvm-client.schema";

export class NanoKVMClient {
	private baseUrl: URL;
	private options: z.output<typeof NanoKVMClientOptions>;
	private token: string | undefined;

	constructor(options: z.input<typeof NanoKVMClientOptions>) {
		this.options = NanoKVMClientOptions.parse(options);

		this.baseUrl = new URL(`${this.options.protocol}://${this.options.host}`);
	}

	get authUrl() {
		return new URL("/api/auth/login", this.baseUrl);
	}

	async init() {
		if (this.options.token) {
			this.token = this.options.token;

			logger.info("sucessfully initialized nanokvm using token from config");
			return;
		}

		this.loginAndSetToken();
	}

	async fetch(path: string, method?: "POST" | "GET", body?: BodyInit) {
		return fetch(new URL(path, this.baseUrl), {
			headers: {
				cookie: `nano-kvm-token=${this.token}`,
			},
			body,
			method,
		});
	}

	/** Calls the login api and stores the returned token */
	async loginAndSetToken() {
		const response = await fetch(this.authUrl, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				username: this.options.username,
				password: encryptPassword(
					this.options.password,
					this.options.passwordSecret,
				),
			}),
		});

		const result = (await response.json()) as z.output<
			typeof AuthLoginSchema
		> | null;

		if (result === null) {
			throw new Error("No response from api!");
		}

		switch (result.code) {
			case 0: {
				logger.debug(`Got token ${result.data.token}`);

				this.token = result.data.token;
				return;
			}
			case -2: {
				logger.fatal(`Invalid password! Failed to get token.`);

				return;
			}
			default: {
				logger.fatal(
					"Unknown error while getting token.",
					(result as z.output<typeof AuthLoginSchema>).msg,
				);
			}
		}
	}
}
