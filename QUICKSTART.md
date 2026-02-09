# 🚀 Quick Start Guide

Get D.A.V.E up and running in minutes!

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Google AI API Key (for Gemini)

## Setup Steps

### 1. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for use in step 3

### 2. Clone and Navigate

```bash
cd "D.A.V.E"
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Google AI API key
# GOOGLE_AI_API_KEY=your_key_here
```

### 4. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local if needed (default values should work)
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # If not already activated
uvicorn app.main:app --reload
```

The backend will start at `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

### 6. Use the Application

1. Open your browser to `http://localhost:3000`
2. Upload security evidence files (PDFs, screenshots, configs)
3. Watch the AI agents process your documents
4. Review the compliance analysis results
5. Download OSCAL artifacts

## 🐳 Docker Quick Start (Alternative)

If you prefer using Docker:

```bash
# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env and add your GOOGLE_AI_API_KEY

# Start all services
docker-compose up
```

Access the application at `http://localhost:3000`

## 📝 Sample Test Files

For testing, you can use:
- Sample security policy PDFs
- Screenshots of cloud console configurations
- Network diagram images
- Configuration files (JSON, YAML)

The system works best with multiple complementary evidence files.

## 🔧 Troubleshooting

**Backend won't start:**
- Verify Python version: `python --version` (should be 3.11+)
- Check that all dependencies installed: `pip list`
- Ensure Google AI API key is set in `.env`

**Frontend won't start:**
- Verify Node.js version: `node --version` (should be 18+)
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`
- Check that `.env.local` exists

**API connection errors:**
- Ensure backend is running on port 8000
- Check CORS settings in backend if accessing from different origin

## 🎯 Next Steps

- Review the [Architecture.md](.internal/Architecture.md) for system design details
- Check [Project_Timeline.md](.internal/Project_Timeline.md) for development roadmap
- See [Gemini_Integration_Description.md](.internal/Gemini_Integration_Description.md) for AI implementation details

## 📧 Support

For issues or questions, please check the documentation or create an issue in the repository.
