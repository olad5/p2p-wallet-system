## Peer-To-Peer Wallet System

This Project funds User wallet balance and handles p2p wallet transfers.

##### Features

* User Signup
* User Login
* Initialize Wallet funding
* Complete wallet funding
* Transfer money to another user wallet
* Get User Wallet

##### Postman API Documentation

[API doc link](https://documenter.getpostman.com/view/19165940/VUjLLn8g#01dbf4aa-e947-4543-8e83-4c49d511b53c)

## Getting Started
### To use the API locally, clone the api with
```bash
  git clone https://github.com/olad5/p2p-wallet-system
```
In order to spin up the project, in the root create .env with these variables, with your own values.

* PORT
* JWT_SECRET
* DATABASE_URL
* SHADOW_DATABASE_URL
* PAYSTACK_SECRET

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# Running the app with Docker

# development
$ docker compose up

```



```bash
## Running the app without Docker

# development
$ yarn run dev

# debug mode
$ yarn run debug

# production mode
$ yarn run start
```

## Run prisma migration

```bash
# development
$ yarn prisma migrate dev

# production mode
$ yarn prisma migrate deploy
```

