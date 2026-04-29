# QA Automation Agent (n8n + Gemini + Selenium)

This workspace contains all the necessary files to build and deploy an autonomous Quality Assurance workflow that generates and runs python Selenium test scripts via chat or webhooks.

## Architecture

*   **Dockerfile:** Extends the official n8n image by installing Python 3, pip, Chromium, and Chrome WebDriver alongside n8n.
*   **docker-compose.yml:** Configuration to bring up n8n, exposing port 5678 and mapping local directories.
*   **workflow.json:** An n8n workflow export that orchestrates receiving requests, calling Gemini API, unpacking the code, writing to disk, running Selenium, and outputting the log.

---

## Deployment Guide

### Prerequisites
1.  **Docker & Docker Compose** installed on your office server.
2.  **Gemini API Key** from Google AI Studio.

### Step 1: Start the Custom n8n Engine
The standard n8n Docker image does not contain Python or browsers. We solve this with Docker Compose.

Open a command prompt or PowerShell inside `d:\JHS\n8n_agent\` and run:

```bash
docker-compose up -d --build
```
> *This will take a minute as it installs Python and the Chromium binaries inside the n8n container.*

### Step 2: Import Workflow
1.  Open your browser and navigate to `http://localhost:5678`.
2.  Follow the setup wizard to create your owner account.
3.  Go to **Workflows** -> **Add Workflow**.
4.  Click the three dots `...` in the top-right corner of the canvas and select **Import from File**.
5.  Select the `workflow.json` file in this directory.

### Step 3: Configure Gemini
1.  Open the node named **Generate Code (Gemini)**.
2.  Look at the `URL` parameter.
3.  Replace `INSERT_YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key.

> **Optional Native Node Migration:** If you prefer, you can replace this `Generate Code (Gemini)` HTTP request node with the native `Google Gemini` UI node now that n8n is running. Since the native node's schema can vary between versions, the HTTP node is provided as a universal fallback.

### Step 4: Execute a Test!
1. At the bottom of the n8n canvas, click **Execute Workflow**.
2. From your terminal, run the following command to submit a test request to the agent (or use Postman):

```bash
curl -X GET "http://localhost:5678/webhook-test/test-chat-agent?feature=Go%20to%20google.com%20and%20verify%20the%20title%20is%20Google"
```

The pipeline will trigger, ask Gemini to write the specified test script, save it to `local_files/dynamic_test.py`, run it headlessly using the included browsers, and return the `stdout`!
