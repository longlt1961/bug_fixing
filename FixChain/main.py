#!/usr/bin/env python3
"""
Main entry point for FixChain2 application
Integrated FastAPI with all controllers using APIRouter
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers instead of apps
from controller import bug_controller, rag_controller, rag_bug_controller

# Create main FastAPI application
app = FastAPI(
    title="FixChain2 - Comprehensive Bug Management & RAG System",
    description="""
    Hệ thống quản lý bugs toàn diện với RAG (Retrieval-Augmented Generation) sử dụng MongoDB và Gemini AI.
    
    ## Tính năng chính:
    
    ### 🐛 Bug Management (Classic)
    - Import bugs từ JSON/CSV
    - Tìm kiếm và phân tích bugs
    - Thống kê và báo cáo
    
    ### 🔍 RAG System (Core)
    - Vector search với MongoDB
    - AI-powered document retrieval
    - Embedding generation với Gemini
    
    ### 🚀 RAG Bug Management (Advanced)
    - Import bugs với vector embedding
    - AI-powered bug search và similarity
    - Intelligent fix suggestions
    - Bug status management với AI insights
    
    ## Technology Stack:
    - **AI Model**: Google Gemini 2.0 Flash
    - **Database**: MongoDB với Vector Search
    - **Framework**: FastAPI + Python
    - **Embedding**: text-embedding-004
    """,
    version="2.0.0",
    contact={
        "name": "FixChain2 Team",
        "email": "support@fixchain2.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    }
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefixes
app.include_router(bug_controller.app, prefix="/api/v1/bugs", tags=["Bug Management"])
app.include_router(rag_controller.app, prefix="/api/v1/rag", tags=["RAG System"])
app.include_router(rag_bug_controller.app, prefix="/api/v1/rag-bugs", tags=["RAG Bug Management"])

@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint với thông tin hệ thống"""
    return {
        "message": "Welcome to FixChain2 - Comprehensive Bug Management & RAG System",
        "version": "2.0.0",
        "services": {
            "bug_management": "/api/v1/bugs",
            "rag_system": "/api/v1/rag", 
            "rag_bug_management": "/api/v1/rag-bugs"
        },
        "documentation": "/docs",
        "openapi_schema": "/openapi.json",
        "health_check": "/health",
        "ai_model": "gemini-2.0-flash-exp",
        "database": "MongoDB with Vector Search"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "bug_management": "active",
            "rag_system": "active",
            "rag_bug_management": "active"
        },
        "ai_model": "gemini-2.0-flash-exp",
        "database": "MongoDB"
    }

def main():
    """
    Main function to start the integrated application
    """
    print("🚀 Starting FixChain2 Integrated API...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 OpenAPI Schema: http://localhost:8000/openapi.json")
    print("")
    print("📋 Available API Groups:")
    print("  🐛 Bug Management: /api/v1/bugs/*")
    print("  🔍 RAG System: /api/v1/rag/*")
    print("  🚀 RAG Bug Management: /api/v1/rag-bugs/*")
    print("")
    print("🌐 Starting server on http://localhost:8000")
    
    # Use app string for proper reload support
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()