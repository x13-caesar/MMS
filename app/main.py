from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from .routers import vendor, specification, component, batch, batch_process, buyer, delivery, employee, operation, \
    process, process_component, product, salary, work, work_specification, warehouse_record, user
from .security import token

app = FastAPI(
    title="Yongfu Manufacturing Management System API",
    description="Only for Yongfu Co. internal use. Regarding technical question please contact xuqiangwen1994@gmail.com",
    version="0.0.1", )

controllers = [vendor, buyer,
               product,
               specification, component,
               batch, batch_process, delivery,
               employee, salary, work, work_specification, warehouse_record,
               process, process_component,
               operation,
               token,
               user
               ]

for controller in controllers:
    app.include_router(controller.router)


origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:4200",
    "http://121.40.125.254:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"author": "x13-caesar"}
#
#
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)