/**
 * Solana Auth worker @ https://solanauth.backpack.workers.dev
 *
 * based off ideas from
 * https://github.com/solana-labs/solana/issues/21366#issuecomment-1194310677
 * https://github.com/web3auth/sign-in-with-solana
 *
 */

import { Hono } from "hono";

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import { cors } from "hono/cors";

import * as bs58 from "bs58";
import {
  CHAIN_ID,
  CONNECTION_URI,
  MEMO_PROGRAM_ADDRESS,
  SECONDS_UNTIL_EXPIRY,
  STATEMENT,
  URI,
  WALLET_PRIVATE_KEY,
} from "./variables";
import { addSeconds, generateNonceHash, validateAuthTx } from "./utils/other";

const connection = new Connection(CONNECTION_URI, "confirmed");

const MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ADDRESS);

const wallet = Keypair.fromSecretKey(bs58.decode(WALLET_PRIVATE_KEY));

const app = new Hono();

app.use("/*", cors());

app.get("/", (c) => c.text("ok"));

app.get("/:publicKey", async (c) => {
  const { hostname, origin } = new URL(URI);

  const pk = new PublicKey(c.req.param("publicKey"));
  const now = new Date();
  const msg = Object.entries({
    URI: origin,
    Version: 1,
    "Chain ID": Number(CHAIN_ID),
    Nonce: "???",
    "Issued At": now.toISOString(),
    "Expiration Time": addSeconds(
      now,
      Number(SECONDS_UNTIL_EXPIRY)
    ).toISOString(),
  }).reduce(
    (acc, [k, v]) => acc.concat(`${k}: ${v}\n`),
    `${hostname} wants you to sign in with your Solana account:
${pk.toString()}

${STATEMENT}

`
  );
  const message = msg.replace("???", await generateNonceHash(msg));
  const tx = new Transaction();
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(message, "utf8"),
    })
  );
  tx.feePayer = pk;
  tx.recentBlockhash = Keypair.generate().publicKey.toString();

  return c.text(
    tx.serialize({ requireAllSignatures: false }).toString("base64")
  );
});

app.post("/:publicKey", async (c) => {
  const publicKey = new PublicKey(c.req.param("publicKey"));
  const tx = Transaction.from(Buffer.from(await c.req.text(), "base64"));
  return c.json(await validateAuthTx(tx, publicKey));
});

app.get("/:publicKey/deposit/:amount", async (c) => {
  const pk = new PublicKey(c.req.param("publicKey"));
  const amount = Number(c.req.param("amount"));

  const tx = new Transaction();

  tx.add(
    SystemProgram.transfer({
      fromPubkey: pk,
      toPubkey: new PublicKey(wallet.publicKey),
      lamports: amount,
    })
  );

  tx.feePayer = pk;
  tx.recentBlockhash = Keypair.generate().publicKey.toString();

  return c.text(
    tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64")
  );
});

app.post("/:publicKey/deposit", async (c) => {
  // TODO: send tx to chain and check if it was successful
});

app.get("/:publicKey/withdraw/:amount", async (c) => {
  // TODO: create transaction to withdraw funds from wallet
});

app.post("/:publicKey/withdraw", async (c) => {
  // TODO: send tx to chain and check if it was successful
});

export default app;
