from fastapi import FastAPI
import uvicorn
from .routers import vendor, specification, component, batch, batch_process, buyer, delivery, employee, operation, \
    process, process_component, product, salary, work, work_specification, user
from .security import token

app = FastAPI(
    title="Yongfu Manufacturing Management System API",
    description="Only for Yongfu Co. internal use. Regarding technical question please contact xuqiangwen1994@gmail.com",
    version="0.0.1", )

controllers = [vendor, buyer,
               product,
               specification, component,
               batch, batch_process, delivery,
               employee, salary, work, work_specification,
               process, process_component,
               operation,
               token,
               user
               ]

for controller in controllers:
    app.include_router(controller.router)


# app.include_router(vendor.router)
# app.include_router(specification.router)
# app.include_router(component.router)


@app.get("/")
async def root():
    return {"author": "x13-caesar"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)