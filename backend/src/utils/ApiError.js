class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.message = message
        // this.data = null
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack.split("\n")
                .filter(line => line.includes("/src/"))
                .map(line => {
                    const match = line.match(/at\s+(?:.*?)([^\/]+\/src\/.+?:\d+:\d+)/);
                    return match ? match[1] : line.trim();
                })
                .filter(Boolean)
                .join("\n");
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export default ApiError 