# About

This boilerplate code simplifies setting up and managing ArcXP IFX in an imperative way.  
It comes with standard commands to manage your integrations, deliver your code, and utilities for faster development.

---

# Project Structure

- **`./integrations/`** - Contains all the integrations.  
- **`./packages/commands`** - Contains all commands that can be run for integrations (e.g., `pnpm run ifx -- <command>`).  
- **`./packages/shared`** - Contains shared code between commands and integrations, such as logger, ArcAPI, and utilities.  
- **`./packages/tsconfig`** - Contains the TypeScript configurations (`tsconfig`) for all packages.

---

# Setup

## Prerequisites

- **Node.js** 22.x or higher.
- **pnpm** 8.x.
- Run `pnpm install` to install all dependencies.
- Create `.env.sandbox` by duplicating `.env.example` and updating the necessary values.

---

## How to Create a New Integration?

1. **Duplicate the `./integrations/hello` folder** and rename it to your integration name.
2. **Update `package.json`:** Set `name` to match your integration name.
3. **Update `ifx-definition.yaml`:** Add your integration settings. Ensure to set `ignore: false` to allow running commands on this integration.  
   Example `ifx-definition.yaml`:
   ```yml
   integrationName: my-first-integration
   description: "This is my first ArcXP IFX integration"
   email: msadovyi@code.store
   events:
     - story:update
     - story:create
   runtime: node
   enabled: true
   ignore: false
   ```
4. Install dependencies: `pnpm install`.
5. Run `pnpm run ifx -- provision` to create the integration on ArcXP. Wait for the provisioning system bundle.
6. Run `pnpm run ifx -- deploy` to deploy the new bundle to IFX.  
7. Run `pnpm run ifx -- provision` again to subscribe to events, set up environment variables, enable/disable the integration, etc.  
8. Write event handlers:
   - Add handlers to the `eventsHandlers` folder.
   - Export them in `eventsHandlers.ts`.
   - Define their usage in the `eventsRouter.json`.

**Note:** Look at handler example here: `./integrations/hello/src/eventsHandlers/example.ts`.

---

# Commands

### General Information

- By default, **all commands run in the `sandbox` environment**. Use the `--env=prod` flag to run commands in production.  
- Running `pnpm run ifx` implicitly runs `turbo run ifx` — it tries to apply this script to all integrations and packages.  
- To run commands for a specific integration:
  - Run it inside the integration's folder.  
  - Use `turbo --filter=@ifx/my-integration-name`.  

---

### Available Commands

#### **1. `pnpm run ifx -- provision`**  
Manages the integration.  
- Applies settings from `ifx-definition.yml` to ArcXP.  
- If the integration doesn't exist, it will be created. After creation, **you must deploy a bundle before updating it any further**.  
- If the integration exists, it will handle actions like:  
  - Enabling/disabling.  
  - Subscribing/unsubscribing to events.  
  - Adding secrets (fetched from `.env.sandbox` or `.env.prod`).  

**Note:** Integration-specific `.env.sandbox` files override the root's `.env.sandbox`.

---

#### **2. `pnpm run ifx -- deploy`**  
Delivers your code to ArcXP:  
- Lints, builds, and packages the integration code.  
- Uploads a new bundle and promotes it on ArcXP.

---

#### **3. `pnpm run ifx -- build`**  
Builds the integration:  
- Runs necessary steps for creating a valid build. (see `build.cmd.ts`)  
- Runs a `health` handler to verify the validity of the build.

---

#### **4. `pnpm run ifx -- promote`**  
Promotes (makes live) the selected bundle.  
- It's recommended to run this in the specific integration folder.  
- You will be prompted to select the bundle to promote.

---

#### **5. `pnpm run ifx -- destroy`**  
Deletes all integrations.

---

#### **6. `pnpm run ifx -- logs`**  
Prints the latest logs for every integration.

---

#### **7. `pnpm run ifx -- status`**  
Prints detailed information about the integrations, including:  
- The integration object itself.  
- Bundles.  
- Subscriptions.  
- Secrets.

---

#### **8. `pnpm run dev`**  
Starts a development server in watch mode:  
- The server listens for `POST` requests to `/`.  
- By default, it uses a random port. Override it with the `PORT` environment variable.

**Example request:**
```bash
curl --location 'http://localhost:54265/' \
--header 'Content-Type: application/json' \
--data '{
    "key": "story:create",
    "body": {
        "id": "test"
    }
}'
```

---

### A Few Notes:
1. **Environment**: Always specify the environment (`sandbox` or `production`) using the `--env` flag when necessary.  
2. **Command Scope**: Run commands within an integration folder for scope, or use `turbo --filter` to target a specific integration.

---

## Happy Developing!
Feel free to explore all commands and contribute to optimizing the flow for managing ArcXP integrations.
