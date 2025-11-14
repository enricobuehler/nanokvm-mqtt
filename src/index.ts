import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { $, Glob } from "bun";
import { getMqttClient } from "./clients/mqtt/mqtt-client";
import { NanoKVMService } from "./clients/nano-kvm/nano-kvm.service";
import { ConfigSchema } from "./config.schema";
import { startListeners } from "./listener";
import { logger } from "./logger";
import { runPublishLoop } from "./publisher";

logger.info("Starting intialization...");

let hasMultipleConfigs = false;

const validConfigs = [];

try {
	const glob = new Glob("*.client.json");

	const configsFolder = process.env.CONFIGS_PATH || "./";

	for await (const fileName of glob.scan(configsFolder)) {
		logger.info(`Found client config ${fileName}, validating...`);

		const fileContent = await readFile(join(configsFolder, fileName), {
			encoding: "utf8",
		}).catch((e) => {
			throw new Error("Error while reading config!", { cause: e });
		});

		const json = JSON.parse(fileContent);

		const result = ConfigSchema.safeParse(json);

		if (result.success) {
			validConfigs.push(result.data);
		}

		if (result.error) {
			logger.fatal(result.error);
		}
	}

	if (validConfigs.length > 0) {
		hasMultipleConfigs = true;
	}

	throw new Error("No valid config found! Exiting...");
} catch {}

logger.info(
	hasMultipleConfigs
		? `Successfully loaded ${validConfigs.length} configs!`
		: "Single config mode",
);

for (const config of validConfigs) {
	const nanoKvmService = new NanoKVMService({ clientOptions: config.nanoKvm });

	await nanoKvmService.init();

	const info = await nanoKvmService.getInfo();

	const mqttClient = await getMqttClient(config.mqtt);

	runPublishLoop(info, nanoKvmService, config, mqttClient);
	startListeners(info, nanoKvmService, config, mqttClient);
}
