# VPS Deploy Setup

This folder is used by `.github/workflows/node-api-cicd.yml`.

## 1) Prepare VPS (one time)

Install:
- Docker Engine + Docker Compose plugin (`docker compose`)
- AWS CLI v2

Create deploy directory (default used by workflow):

```bash
sudo mkdir -p /opt/node-express-api
sudo chown -R $USER:$USER /opt/node-express-api
```

## 2) Create GitHub repository secrets

Required:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REPOSITORY` (example: `node-express-api`)
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY` (private key content for SSH)
- `APP_ENV_B64` (base64-encoded full `.env` file content used by the API/DB containers)

Optional:
- `VPS_PORT` (default: `22`)
- `VPS_DEPLOY_PATH` (default: `/opt/node-express-api`)

Build `APP_ENV_B64` from `deploy/.env.vps.example` (or your own `.env`):

Linux/macOS:
```bash
base64 -w 0 .env
```

PowerShell:
```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content -Raw .env)))
```

## 3) Deployment flow

On push to `main` (or manual run):
1. Install dependencies and build TypeScript.
2. Build Docker image and push to ECR (`<sha7>` + `latest` tags).
3. SSH into VPS.
4. Create/update `.env` on VPS from `APP_ENV_B64`.
5. Login to ECR from VPS.
6. Pull the new image, run Prisma migrations, and restart API container.
