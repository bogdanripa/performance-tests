import azure.functions as func
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="childpy")
def childpy(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("DONE", status_code=200)