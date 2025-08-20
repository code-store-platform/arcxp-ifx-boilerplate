# About

This boilerplate code simplifies setting up and managing ArcXP IFX in an imperative way.
It comes with standard commands to manage your integrations, deliver your code, and utilities for faster development.

You can start a new project by forking this repository directly.
Alternatively, copy the code into a new repo and later add this boilerplate as a remote to stay in sync. To sync changes from the boilerplate, run:

```bash
git remote add boilerplate https://github.com/code-store-platform/arcxp-ifx-boilerplate.git
git fetch boilerplate
git merge boilerplate/main
```

---

# Project Structure

* **`./integrations/`** – All integrations live here.
* **`./packages/commands`** – Command implementations.
* **`./packages/shared`** – Shared utilities (logger, ArcAPI, etc).
* **`./packages/tsconfig`** – Centralized TypeScript configs.

---

# Setup

## Prerequisites

* **Node.js** 22.x or higher
* **pnpm** 8.x
* Run `pnpm install` to install dependencies
* Create `.env.sandbox` from `.env.example` and fill in required values

---

# Creating a New Integration

1. Run:

   ```bash
   pnpm ifx init
   ```

   * Creates a new integration folder under `./integrations/`.
   * Installs dependencies and provisions it in IFX.

2. Add event handlers:

   * Implement handlers in `eventsHandlers/` and export them in `eventsHandlers.ts`.
   * Wire them up in `eventsRouter.json`.

3. Deploy:

   ```bash
   pnpm ifx deploy
   ```

4. Update IFX definition:

   ```bash
   pnpm ifx provision
   ```

> Example handler: `./integrations/hello/src/eventsHandlers/example.ts`.

---

# Commands

### General

* Commands default to the **sandbox** environment. Use `--env=prod` for production.
* You can run commands for a **specific integration** using:

  ```bash
  pnpm ifx <command> --integration=my-integration
  ```
* Or run them for all integrations by omitting `--integration`.

---

### Available Commands

#### `pnpm ifx init`

Initialize a new integration.

#### `pnpm ifx provision`

Create or update the integration in IFX using `ifx-definition.yml`.

#### `pnpm ifx deploy`

Build and deploy the integration bundle to IFX.

#### `pnpm ifx build`

Build the integration and validate with the `health` handler.

#### `pnpm ifx promote`

Promote a deployed bundle to **LIVE**.

#### `pnpm ifx destroy`

Delete an integration.

#### `pnpm ifx logs`

Show latest logs for integrations.

#### `pnpm ifx status`

Show detailed integration information (bundles, subscriptions, secrets, etc).

#### `pnpm ifx dev`

Run the integration locally in watch mode.

* Default: random port.
* Override with `PORT` env.

Example request:

```bash
curl --location 'http://localhost:54265/' \
--header 'Content-Type: application/json' \
--data '{
  "key": "story:create",
  "body": { "id": "test" }
}'
```

---

# Notes

1. Always specify `--env` (`sandbox` or `prod`) when needed.
2. Use `--integration=<name>` to scope commands to a single integration.

---

## Happy Developing 🎉

This CLI streamlines the workflow for managing ArcXP IFX integrations.
