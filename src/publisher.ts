import { sleep } from "bun";
import type { MqttClient } from "mqtt";
import type z from "zod";
import type { NanoKVMService } from "./clients/nano-kvm/nano-kvm.service";
import type { InfoSchema } from "./clients/nano-kvm/nano-kvm-client.schema";
import type { ConfigSchema } from "./config.schema";
import { logger } from "./logger";

export async function runPublishLoop(
	info: z.output<typeof InfoSchema>,
	nanoKvmService: NanoKVMService,
	config: z.output<typeof ConfigSchema>,
	mqttClient: MqttClient,
) {
	while (true) {
		const entityIds = {
			gpio: {
				hdd: "gpio_hdd",
				power: "gpio_power",
			},
			actions: {
				triggerPower: "action_trigger_power",
				triggerReset: "action_trigger_reset",
			},
		};

		const origin = {
			name: "nanokvm-mqtt",
			sw: "0.0.1",
			url: "https://github.com/enricobuehler/nanokvm-mqtt",
		};

		const state_topic = `nanokvm-mqtt/${info.deviceKey}`;

		const device = {
			hw_version: 0,
			identifiers: [info.deviceKey],
			manufacturer: "Sipeed",
			model: "Sipeed NanoKVM",
			model_id: "unknown",
			name: info.mdns,
			sw_version: info.application,
		};

		// State

		await mqttClient.publishAsync(
			`homeassistant/binary_sensor/${info.deviceKey}/power/config`,
			JSON.stringify({
				default_entity_id: `binary_sensor.${info.deviceKey}_${entityIds.gpio.power}`,
				device,
				device_class: "power",
				object_id: `nanokvm_${info.deviceKey}`,
				origin,
				state_topic,
				payload_off: false,
				payload_on: true,
				unique_id: `${info.deviceKey}_nanokvm_${entityIds.gpio.power}`,
				value_template: "{{ value_json.power }}",
			}),
		);

		await mqttClient.publishAsync(
			`homeassistant/binary_sensor/${info.deviceKey}/hdd/config`,
			JSON.stringify({
				default_entity_id: `binary_sensor.${info.deviceKey}_${entityIds.gpio.hdd}`,
				device,
				name: "HDD Activity",
				object_id: `nanokvm_${info.deviceKey}_${entityIds.gpio.hdd}`,
				origin,
				state_topic,
				payload_off: false,
				payload_on: true,
				unique_id: `${info.deviceKey}_nanokvm_${entityIds.gpio.hdd}`,
				value_template: "{{ value_json.hdd }}",
			}),
		);

		logger.debug("AutoDiscovery - Published states");

		// Actions

		await mqttClient.publishAsync(
			`homeassistant/button/${info.deviceKey}/button-trigger-power/config`,
			JSON.stringify({
				device,
				command_topic: `${state_topic}/trigger-power`,
				default_entity_id: `button.${info.deviceKey}_${entityIds.actions.triggerPower}`,
				name: "Trigger Power",
				object_id: `nanokvm_${info.deviceKey}_${entityIds.actions.triggerPower}`,
				payload_press: "trigger_power",
				unique_id: `${info.deviceKey}_nanokvm_${entityIds.actions.triggerPower}`,
			}),
		);

		await mqttClient.publishAsync(
			`homeassistant/button/${info.deviceKey}/button-trigger-reset/config`,
			JSON.stringify({
				device,
				command_topic: `${state_topic}/trigger-reset`,
				default_entity_id: `button.${info.deviceKey}_${entityIds.actions.triggerReset}`,
				name: "Trigger Reset",
				object_id: `nanokvm_${info.deviceKey}_${entityIds.actions.triggerReset}`,
				payload_press: "trigger_reset",
				unique_id: `${info.deviceKey}_nanokvm_${entityIds.actions.triggerReset}`,
			}),
		);

		//

		logger.debug("AutoDiscovery - Published actions");

		const gpio = await nanoKvmService.getGpio();

		await mqttClient.publishAsync(
			`nanokvm-mqtt/${info.deviceKey}`,
			JSON.stringify({
				power: gpio.pwr,
				hdd: gpio.hdd,
			}),
		);

		//console.log(info.ips);
		//console.log(gpio);

		await sleep(config.publishInterval);
	}
}
