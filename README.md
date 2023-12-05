# Docker compose remote manager web app

A simple web app to manage docker compose services via the [`docker-compose-remote-manager API`](https://github.com/MatthiasHarzer/docker-compose-remote-manager).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### Setup
Add a `.env` file in the projects root directory and provide the `VITE_REMOTE_COMPOSE_MANAGER_ENPOINT` where the [`docker-compose-remote-manager`](https://github.com/MatthiasHarzer/docker-compose-remote-manager) is hosted. Don't include a protocol, just the domain or ip address.

For example:
```env
VITE_REMOTE_COMPOSE_MANAGER_ENPOINT=compose-api.example.com
```
