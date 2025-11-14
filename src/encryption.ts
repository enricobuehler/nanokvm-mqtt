import crypto from "node:crypto";

export const encryptPassword = (password: string, passphrase: string) => {
	// OpenSSL's default salt is 8 bytes
	const salt = crypto.randomBytes(8);

	// Derive key and IV using MD5 (matching OpenSSL's -md md5)
	// OpenSSL uses EVP_BytesToKey algorithm
	const keyIv = evpBytesToKey(passphrase, salt, 32, 16); // 32 bytes key, 16 bytes IV for AES-256

	// Create cipher
	const cipher = crypto.createCipheriv("aes-256-cbc", keyIv.key, keyIv.iv);

	// Encrypt the password
	let encrypted = cipher.update(password, "utf8");
	encrypted = Buffer.concat([encrypted, cipher.final()]);

	// OpenSSL prepends "Salted__" + salt to the encrypted data
	const saltedPrefix = Buffer.from("Salted__", "utf8");
	const result = Buffer.concat([saltedPrefix, salt, encrypted]);

	// Return base64 encoded result
	return result.toString("base64");
};

// EVP_BytesToKey implementation (OpenSSL's key derivation)
const evpBytesToKey = (
	password: string,
	salt: Buffer,
	keyLen: number,
	ivLen: number,
) => {
	const md5 = (data: Buffer) => crypto.createHash("md5").update(data).digest();

	let derived = Buffer.alloc(0);
	let hash = Buffer.alloc(0);

	while (derived.length < keyLen + ivLen) {
		hash = md5(Buffer.concat([hash, Buffer.from(password, "utf8"), salt]));
		derived = Buffer.concat([derived, hash]);
	}

	return {
		key: derived.slice(0, keyLen),
		iv: derived.slice(keyLen, keyLen + ivLen),
	};
};
