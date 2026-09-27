# 🚀 Healthcare Text Intelligence — Cloud Deployment Guide

This application is built with a single-service architecture: **FastAPI serves both the REST API and the production React frontend** from `frontend/dist`. You can deploy it to any cloud host for free in just a few minutes.

---

## 🌟 Option 1: Deploy on Render.com (Free & Recommended)

Render provides free Docker/Web Service hosting with HTTPS.

### Steps:
1. Push your project code to a **GitHub repository** (e.g. `github.com/your-username/healthcare-nlp-case-study`).
2. Go to **[Render.com](https://render.com/)** and sign in with GitHub.
3. Click **New +** $\rightarrow$ **Web Service**.
4. Select your GitHub repository.
5. In the settings:
   - **Name**: `healthcare-text-intelligence`
   - **Language / Environment**: `Docker`
   - **Branch**: `main` (or `master`)
   - **Plan**: `Free`
6. Click **Create Web Service**.
7. Render will automatically build the Docker image and give you a public URL (e.g., `https://healthcare-text-intelligence.onrender.com`).

---

## 🚂 Option 2: Deploy on Railway.app (Fastest & Easiest)

Railway offers automated container builds from GitHub.

### Steps:
1. Go to **[Railway.app](https://railway.app/)** and log in with GitHub.
2. Click **+ New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your `healthcare-nlp-case-study` repository.
4. Railway will automatically detect the `Dockerfile` and start building.
5. Once deployed, go to **Settings** $\rightarrow$ **Networking** $\rightarrow$ Click **Generate Domain**.
6. Your app is live with a public URL (e.g. `https://healthcare-nlp-production.up.railway.app`).

---

## 🤗 Option 3: Deploy on Hugging Face Spaces (100% Free for ML/NLP)

Hugging Face Spaces offers free permanent hosting for AI/NLP projects.

### Steps:
1. Go to **[huggingface.co/spaces](https://huggingface.co/spaces)** and log in.
2. Click **Create new Space**.
3. Set:
   - **Space Name**: `healthcare-nlp-intelligence`
   - **License**: `mit` or `apache-2.0`
   - **Space SDK**: Choose **`Docker`** $\rightarrow$ **`Blank`**
4. Clone the new Space repo or upload your project files (including `Dockerfile`, `requirements.txt`, `backend/`, `frontend/`, `data/`, `results/`, `scripts/`).
5. In your Space's `README.md` frontmatter, ensure the port is set to 8000:
   ```yaml
   ---
   title: Healthcare NLP Intelligence
   emoji: 🏥
   colorFrom: blue
   colorTo: green
   sdk: docker
   app_port: 8000
   ---
   ```
6. Hugging Face will automatically build and run your interactive dashboard!

---

## 🐳 Option 4: Deploy on Any VPS / Cloud Server with Docker

If you have an Ubuntu/Debian VPS (DigitalOcean, AWS EC2, GCP, Azure, Linode):

```bash
# 1. Clone repository
git clone https://github.com/your-username/healthcare-nlp-case-study.git
cd healthcare-nlp-case-study

# 2. Build and run container
docker-compose up -d --build

# 3. Access in browser
# http://<YOUR_SERVER_PUBLIC_IP>:8000
```
