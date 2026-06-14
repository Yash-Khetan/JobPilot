from internshala_scraper1 import internshala_scraper
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return "This the home page of Scrappy"


@app.get("/intershala_jobs")
def get_intershala_jobs(role: str, location: str, stipend: str = None):
    return internshala_scraper(role, location, stipend)