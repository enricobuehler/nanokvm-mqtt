import z from "zod";

const ResponseBody = z.object({
	code: z.number(),
	msg: z.string(),
	data: z.any(),
});

const CODE_SUCCESS = z.literal(0);

export const NanoKVMClientOptions = z.object({
	/** host of nanokvm */
	host: z.string(),
	/** the nanokvm username */
	username: z.string(),
	/** the nanokvm password */
	password: z.string(),
	/** password secret, optional.
	 * only needs to be set if a different secret is set on the nanokvm for more secure password encryption. */
	passwordSecret: z.string().default("nanokvm-sipeed-2024"),
	/** https isn't usable by default so we use http */
	protocol: z.enum(["http", "https"]).default("http"),
	/** You can provide a token which can improve reliability */
	token: z.string().optional(),
});

// POST - /api/auth/login

export const AuthLoginSchemaSuccess = ResponseBody.extend({
	code: CODE_SUCCESS,
	data: z.object({
		token: z.string(),
	}),
});

export const AuthLoginSchemaInvalidPassword = ResponseBody.extend({
	code: z.literal(-2),
});

export const AuthLoginSchema = z.discriminatedUnion("code", [
	AuthLoginSchemaSuccess,
	AuthLoginSchemaInvalidPassword,
]);

// GET - /api/vm/info

export const InfoSchema = z.object({
	ips: z.array(
		z.object({
			name: z.string(),
			addr: z.string(),
			version: z.string(),
			type: z.string(),
		}),
	),
	mdns: z.string(),
	image: z.string(),
	application: z.string(),
	deviceKey: z.string(),
});

export const InfoSuccess = ResponseBody.extend({
	code: CODE_SUCCESS,
	data: InfoSchema,
});

// GET - /api/vm/gpio

export const GpioSchema = z.object({
	pwr: z.boolean(),
	hdd: z.boolean(),
});

export const GpioSuccess = ResponseBody.extend({
	code: CODE_SUCCESS,
	data: GpioSchema,
});

// POST - /api/vm/gpio

export const TriggerPowerError = ResponseBody.extend({
	code: z.literal(-1),
	data: z.null(),
});

export const TriggerPowerSuccess = ResponseBody.extend({
	code: CODE_SUCCESS,
	data: z.null(),
});

export const TriggerPowerSchema = z.discriminatedUnion("code", [
	TriggerPowerSuccess,
	TriggerPowerError,
]);

export const TriggerPowerInput = z.object({
	type: z.literal("power").default("power"),
	duration: z.number().min(0).max(20000).default(800),
});
