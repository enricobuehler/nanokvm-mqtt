import type { MqttClient } from "mqtt";
import type z from "zod";
import type { NanoKVMService } from "./clients/nano-kvm/nano-kvm.service";
import type { InfoSchema } from "./clients/nano-kvm/nano-kvm-client.schema";
import type { ConfigSchema } from "./config.schema";
import { logger } from "./logger";

export async function startListeners(
	info: z.output<typeof InfoSchema>,
	nanoKvmService: NanoKVMService,
	_config: z.output<typeof ConfigSchema>,
	mqttClient: MqttClient,
) {
	await mqttClient.subscribeAsync(`nanokvm-mqtt/${info.deviceKey}/+`);

	mqttClient.on("message", async (topic, payload) => {
		logger.info(topic, payload);

		const pathParts = topic.split("/");

		const action = pathParts[pathParts.length - 1];

		switch (action) {
			case "trigger-power": {
				await nanoKvmService.triggerPower({});

				return;
			}
			case "trigger-reset": {
				await nanoKvmService.triggerReset();

				return;
			}

			default: {
				throw new Error(`Unhandled action: ${action}`);
			}
		}
	});
}
