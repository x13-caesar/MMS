from fastapi import FastAPI
import service

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/vendor")
async def get_vendor():
    return service.get_vendors()