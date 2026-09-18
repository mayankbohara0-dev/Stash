import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.endpoints import auth, transactions, budgets, finance, dashboard, ai, profile, insights

app = FastAPI(
    title="MoneyMate API",
    description="Personal Finance Management API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(finance.goals_router)
app.include_router(finance.recurring_router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(profile.router)
app.include_router(insights.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MoneyMate API"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Never expose stack traces in production
    if settings.DEBUG:
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )
