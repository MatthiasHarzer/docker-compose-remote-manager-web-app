# Docker compose remote manager web app

A simple web app to manage docker compose services via the [`docker-compose-remote-manager API`](https://github.com/MatthiasHarzer/docker-compose-remote-manager).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Setup
Add a `.env` file in the projects root directory and provide the `VITE_REMOTE_COMPOSE_MANAGER_ENDPOINT` where the [`docker-compose-remote-manager`](https://github.com/MatthiasHarzer/docker-compose-remote-manager) is hosted. You can specify, whether a secure protocol should be used or not by adding `https://` / `wss://` or `http://` / `ws://` to the endpoint. If not specified, `https://` / `wss://` will be used by default.

For example:
```env
VITE_REMOTE_COMPOSE_MANAGER_ENDPOINT=compose-api.example.com
```

## Usage
To access the services, make sure to add the `access_key` query parameter to the url when accessing the website. The web app will automatically determine the services available to you.

