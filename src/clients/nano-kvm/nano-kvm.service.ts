import type z from "zod";
import { NanoKVMClient } from "./nano-kvm-client";
import {
	type GpioSchema,
	GpioSuccess,
	type InfoSchema,
	InfoSuccess,
	type NanoKVMClientOptions,
	TriggerPowerInput,
	TriggerPowerSchema,
} from "./nano-kvm-client.schema";

export class NanoKVMService {
	private client: NanoKVMClient;

	constructor(options: {
		clientOptions: z.input<typeof NanoKVMClientOptions>;
	}) {
		this.client = new NanoKVMClient(options.clientOptions);
	}

	async init() {
		await this.client.init();
	}

	async getInfo(): Promise<z.output<typeof InfoSchema>> {
		const data = await (await this.client.fetch("/api/vm/info", "GET")).json();

		return InfoSuccess.parse(data).data;
	}

	async getGpio(): Promise<z.output<typeof GpioSchema>> {
		const response = await this.client.fetch("/api/vm/gpio", "GET");

		const data = await response.json();

		return GpioSuccess.parse(data).data;
	}

	async triggerPower(input: z.input<typeof TriggerPowerInput>) {
		const parsedInput = TriggerPowerInput.parse(input);

		console.log(parsedInput);

		const body = new FormData();

		body.append("Type", parsedInput.type);
		body.append("Duration", parsedInput.duration.toString());

		const response = await this.client.fetch("/api/vm/gpio", "POST", body);

		const data = await response.json();

		const parsed = TriggerPowerSchema.parse(data);

		return parsed;
	}

	async triggerReset() {
		const result = await this.triggerPower({ duration: 8000 });

		return result;
	}
}
