class AllowCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = "https://livesignal-frontend.onrender.com"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
