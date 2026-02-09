# 🚀 Deployment Guide

Deploy D.A.V.E to production environments.

## Deployment Options

### Option 1: Google Cloud Run (Recommended)

#### Prerequisites
- Google Cloud Project
- gcloud CLI installed
- Docker installed

#### Backend Deployment

1. **Build and push container:**
```bash
cd backend

# Set your project ID
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

# Build the image
gcloud builds submit --tag gcr.io/$PROJECT_ID/dave-backend

# Or build locally and push
docker build -t gcr.io/$PROJECT_ID/dave-backend .
docker push gcr.io/$PROJECT_ID/dave-backend
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy dave-backend \
  --image gcr.io/$PROJECT_ID/dave-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_AI_API_KEY=your_api_key \
  --set-env-vars DATABASE_URL=your_database_url \
  --set-env-vars REDIS_URL=your_redis_url \
  --memory 2Gi \
  --timeout 300s
```

3. **Note the service URL** (e.g., `https://dave-backend-xxx.run.app`)

#### Frontend Deployment

1. **Update environment:**
```bash
cd frontend

# Create production .env
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.run.app" > .env.production
```

2. **Deploy to Vercel (easiest):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or **deploy to Cloud Run:**
```bash
# Build the image
docker build -t gcr.io/$PROJECT_ID/dave-frontend .
docker push gcr.io/$PROJECT_ID/dave-frontend

# Deploy
gcloud run deploy dave-frontend \
  --image gcr.io/$PROJECT_ID/dave-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=https://dave-backend-xxx.run.app
```

### Option 2: AWS (ECS + Fargate)

#### Backend on ECS

1. **Push to ECR:**
```bash
aws ecr create-repository --repository-name dave-backend

aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -t dave-backend .
docker tag dave-backend:latest \
  YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dave-backend:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/dave-backend:latest
```

2. **Create ECS Task Definition** (use AWS Console or CLI)

3. **Deploy to Fargate**

#### Frontend on Amplify or S3+CloudFront

```bash
npm run build
aws s3 sync out/ s3://your-bucket-name
```

### Option 3: Traditional VPS (DigitalOcean, Linode, etc.)

#### Backend Setup

```bash
# SSH into server
ssh user@your-server-ip

# Install dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv nginx

# Clone repo
git clone your-repo-url
cd D.A.V.E/backend

# Setup Python
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with production values

# Install supervisor for process management
sudo apt install supervisor

# Create supervisor config
sudo nano /etc/supervisor/conf.d/dave-backend.conf
```

Supervisor config:
```ini
[program:dave-backend]
directory=/home/user/D.A.V.E/backend
command=/home/user/D.A.V.E/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
user=user
autostart=true
autorestart=true
stderr_logfile=/var/log/dave-backend.err.log
stdout_logfile=/var/log/dave-backend.out.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start dave-backend
```

#### Frontend Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Build frontend
cd ../frontend
npm install
npm run build

# Serve with nginx
sudo nano /etc/nginx/sites-available/dave-frontend
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dave-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start frontend with PM2
sudo npm install -g pm2
pm2 start npm --name "dave-frontend" -- start
pm2 save
pm2 startup
```

## Production Considerations

### Environment Variables

**Backend (.env):**
```bash
GOOGLE_AI_API_KEY=your_production_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379/0
GCS_BUCKET_NAME=dave-production-storage
GCS_PROJECT_ID=your-project-id
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://your-frontend-domain.com
SECRET_KEY=generate-strong-secret-key
```

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Database Setup

#### PostgreSQL on Cloud

**Google Cloud SQL:**
```bash
gcloud sql instances create dave-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create dave_production \
  --instance=dave-db

gcloud sql users set-password postgres \
  --instance=dave-db \
  --password=your-secure-password
```

**AWS RDS:**
Use AWS Console to create PostgreSQL instance.

### Redis Setup

**Google Cloud Memorystore:**
```bash
gcloud redis instances create dave-cache \
  --size=1 \
  --region=us-central1
```

**AWS ElastiCache:**
Use AWS Console to create Redis cluster.

### SSL/HTTPS

#### With Cloudflare (Free)
1. Add your domain to Cloudflare
2. Update DNS records
3. Enable "Full" SSL mode
4. Done! Free SSL certificate

#### With Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Monitoring & Logging

#### Google Cloud
```bash
# Enable Cloud Logging
gcloud logging write my-log "Application started" --severity=INFO

# Set up alerts
gcloud alpha monitoring policies create --config-from-file=alert-policy.yaml
```

#### Application Performance Monitoring
Consider integrating:
- **Sentry** for error tracking
- **New Relic** for performance monitoring
- **DataDog** for comprehensive observability

### Scaling

#### Horizontal Scaling
- Cloud Run: Automatic (up to 100 instances)
- ECS: Configure auto-scaling
- VPS: Add load balancer + multiple instances

#### Caching Strategy
```python
# Add to backend for API response caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url(settings.redis_url)
    FastAPICache.init(RedisBackend(redis), prefix="dave-cache")
```

### Backup Strategy

#### Database Backups
```bash
# Automated daily backups
gcloud sql backups create --instance=dave-db --async

# Manual backup
pg_dump -h host -U user -d dave_production > backup.sql
```

#### File Storage Backups
```bash
# Google Cloud Storage versioning
gsutil versioning set on gs://dave-production-storage
```

### Security Checklist

- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Environment variables secured (use Secret Manager)
- [ ] Database connections encrypted
- [ ] API key rotation policy
- [ ] Regular security updates
- [ ] Input validation enabled
- [ ] SQL injection protection
- [ ] XSS protection enabled

### Cost Optimization

#### Google Cloud
- Use Cloud Run (pay per use)
- Enable autoscaling
- Use Cloud CDN for static assets
- Implement caching

#### AWS
- Use Fargate Spot for non-critical workloads
- S3 + CloudFront for frontend
- Enable auto-scaling
- Use Reserved Instances for predictable workloads

### CI/CD Pipeline

#### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v0
        with:
          service: dave-backend
          image: gcr.io/${{ secrets.GCP_PROJECT_ID }}/dave-backend
          region: us-central1
          credentials: ${{ secrets.GCP_SA_KEY }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Post-Deployment Testing

1. Health check: `curl https://api.your-domain.com/health`
2. Upload test file
3. Verify processing completes
4. Check logs for errors
5. Test OSCAL download
6. Monitor performance metrics

## Rollback Plan

```bash
# Cloud Run
gcloud run services update-traffic dave-backend \
  --to-revisions=PREVIOUS_REVISION=100

# Vercel
vercel rollback
```

## Support & Monitoring

Set up alerts for:
- API errors (>5%)
- Response time (>5s)
- Memory usage (>80%)
- Disk usage (>80%)
- Failed deployments

## Production URL Structure

- Frontend: `https://dave.your-domain.com`
- API: `https://api.dave.your-domain.com`
- Health: `https://api.dave.your-domain.com/health`
- Docs: `https://api.dave.your-domain.com/docs` (disable in production!)

---

For questions or issues, refer to [QUICKSTART.md](QUICKSTART.md) or [TESTING.md](TESTING.md).
