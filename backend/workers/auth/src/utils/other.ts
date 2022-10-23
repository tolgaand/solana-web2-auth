import { PublicKey, Transaction } from "@solana/web3.js";
import { MEMO_PROGRAM_ADDRESS, NONCE_LENGTH, STATEMENT } from "../variables";
import { ParsedMessage } from "./regex";
const MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ADDRESS);

export const validateAuthTx = async (
  tx: Transaction,
  pk: PublicKey
): Promise<boolean> => {
  try {
    const inx = tx.instructions[0];

    if (!inx.programId.equals(MEMO_PROGRAM_ID))
      throw new Error("Invalid program ID");

    const data = new TextDecoder().decode(inx.data);

    const expectedNonce = await generateNonceHash(
      data.replace(/Nonce: (.+)\n/, "Nonce: ???\n")
    );
    const parsed = new ParsedMessage(data);

    if (parsed.address !== pk.toString()) throw new Error("Invalid address");
    if (parsed.nonce !== expectedNonce) throw new Error("Invalid nonce");
    if (parsed.statement !== STATEMENT) throw new Error("Invalid message");

    const now = new Date();
    if (!parsed.issuedAt || parsed.issuedAt >= now)
      throw new Error("Invalid issuedAt");
    if (!parsed.expirationTime || parsed.expirationTime < now)
      throw new Error("Expired");

    if (!tx.verifySignatures()) throw new Error("Unable to verify signatures");
    if (!tx.signatures.some(({ publicKey }) => pk.equals(publicKey))) {
      throw new Error(`Could not find public key ${pk.toString()}`);
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
};

export const generateNonceHash = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, Number(NONCE_LENGTH));
};

export const addSeconds = (date: Date, seconds: number) => {
  const now = new Date(date);
  now.setSeconds(now.getSeconds() + seconds);
  return now;
};
