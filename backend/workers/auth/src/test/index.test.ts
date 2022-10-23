import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import app from "..";
import { CONNECTION_URI } from "../variables";

import { Wallet } from "@project-serum/anchor";

const fakeWallet = Keypair.generate();

const anchorWallet = new Wallet(fakeWallet);

type CreateUnsignedTransactionType = {
  unsignedTransaction: string;
};

type ConfirmUnsignedTransactionType = {
  ok: boolean;
};

describe("Test the application", () => {
  let unsignedTransaction = "";

  it("Should return 200 response", async () => {
    const res = await app.request("http://localhost/");
    expect(res.status).toBe(200);
  });

  it("Get an unsigned transaction to sig in", async () => {
    const res = await app.request(
      `http://localhost/${fakeWallet.publicKey.toString()}`
    );
    const data: CreateUnsignedTransactionType = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("unsignedTransaction");

    unsignedTransaction = data.unsignedTransaction;
  });

  it("Sign and verify the unsigned transaction", async () => {
    const tx = Transaction.from(Buffer.from(unsignedTransaction, "base64"));

    const signedTx = await anchorWallet.signTransaction(tx);

    const res = await app.request(
      `http://localhost/${fakeWallet.publicKey.toString()}`,
      {
        method: "POST",
        body: signedTx.serialize().toString("base64"),
      }
    );
    const data: ConfirmUnsignedTransactionType = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("ok");
    expect(data.ok).toBe(true);
  });
});
