

import sys
import os
# Ensure 'app' is importable when running pytest from backend root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Load test environment variables before importing app
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.test'))

import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from app.main import app

import asyncio


@pytest.mark.asyncio
async def test_status_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/status/test-id")
        assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_analyze_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        files = {"file": ("dummy.txt", b"dummy content")}
        response = await ac.post("/api/analyze", files=files)
        assert response.status_code in (200, 422)
