import { writeFile } from "node:fs/promises";
import z from "zod";
import { ConfigSchema } from "@/config.schema";

const jsonSchema = z.toJSONSchema(ConfigSchema);

await writeFile("./config-schema.json", JSON.stringify(jsonSchema));
