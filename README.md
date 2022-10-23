# Solana Web2 Auth

To verify your login and deposit/withdraw transactions with web2.

## Todo

- [ ] Send tx to chain and check if it was successful.
- [ ] Create transaction to withdraw funds from wallet.
- [ ] Send tx to chain and check if it was successful.

## Run Locally

Clone the project

```bash
  git clone https://github.com/tolgaand/solana-web2-auth
```

Go to the project directory

```bash
  cd backend/workers/auth
```

Install dependencies

```bash
  yarn install
```

Run Tests

```bash
  yarn test
```

Start the server

```bash
  yarn dev
```

Deploy to cloudflare

```bash
  yarn publish
```

## API Reference

#### Create, sign and confirm a signature to log in.

```curl
 curl --location --request GET `http://127.0.0.1:8787/${publicKey}`
```

| Parameter   | Type     | Description                             |
| :---------- | :------- | :-------------------------------------- |
| `publicKey` | `string` | **Required**. Login to wallet publickey |

Response

```json
{
  "unsignedTransaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECyIchCFWi8XOQK9v26xdqOA6+Nh0PxppQs5xbNaKQd78FSlNamSkhBk0k6HFg2jh8fDW13bySu4HkH6hAQQVEjeQXXr7I42Lu1kNGK1/vIAG92+8qkLMG8qRvlg4pHrwwAQEApAJsb2NhbGhvc3Qgd2FudHMgeW91IHRvIHNpZ24gaW4gd2l0aCB5b3VyIFNvbGFuYSBhY2NvdW50OgpFVm4zb2ZYaXZWTFJ3VXl5U2ZhVE02UmVuanZOTkhUeTM5VFpqMW91QWFITAoKU2lnbiBpbiB3aXRoIFNvbGFuYSB0byB0aGUgYXBwLgoKVVJJOiBodHRwOi8vbG9jYWxob3N0OjMwMDAKVmVyc2lvbjogMQpDaGFpbiBJRDogMQpOb25jZTogN2ZmZWJlMjg3ZWJhYTEzOWQyNzgKSXNzdWVkIEF0OiAyMDIyLTEwLTIzVDEzOjQyOjUzLjEzM1oKRXhwaXJhdGlvbiBUaW1lOiAyMDIyLTEwLTIzVDEzOjQzOjUzLjEzM1oK"
}
```

#### Approve unsigned transaction

```curl
curl --location --request POST `http://127.0.0.1:8787/${publicKey}` \
--header 'Content-Type: text/plain' \
--data-raw ${unsignedTransaction}
```

| Parameter             | Type     | Description                                       |
| :-------------------- | :------- | :------------------------------------------------ |
| `publicKey`           | `string` | **Required**. Login to wallet publickey           |
| `unsignedTransaction` | `string` | **Required**. The unsigned transaction you signed |

Response

```json
{
  "ok": true
}
```
