import z from "zod";
import { MQTTClientOptions } from "./clients/mqtt/mqtt-client.schema";
import { NanoKVMClientOptions } from "./clients/nano-kvm/nano-kvm-client.schema";

export const ConfigSchema = z.object({
	nanoKvm: NanoKVMClientOptions,
	mqtt: MQTTClientOptions,
	publishInterval: z.number().default(2000),
});
