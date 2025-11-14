import mqtt from "mqtt";
import type z from "zod";
import type { MQTTClientOptions } from "./mqtt-client.schema";

export async function getMqttClient(
	options: z.output<typeof MQTTClientOptions>,
) {
	return await mqtt.connectAsync(`mqtt://${options.host}:${options.port}`, {
		password: options.password,
		username: options.user,
	});
}
