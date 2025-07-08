class AllowCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Allow Netlify to receive and send cookies
        response["Access-Control-Allow-Origin"] = "https://livesignal.netlify.app"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
