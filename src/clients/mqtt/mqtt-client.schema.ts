import z from "zod";

export const MQTTClientOptions = z.object({
	password: z.string().optional(),
	user: z.string().optional(),
	host: z.string(),
	port: z.number(),
});
