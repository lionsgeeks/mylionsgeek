const ExpiredLink = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-lg rounded-lg border-t-4 border-yellow-400 bg-white p-8 text-center shadow-lg">
                <div className="mb-4 text-5xl text-yellow-400">⚠️</div>

                <h1 className="mb-3 text-2xl font-bold text-gray-800 md:text-3xl">This Link Has Expired</h1>

                <p className="mb-4 text-base text-gray-600 md:text-lg">
                    Oops! Your profile completion link is no longer valid. For security, links expire after <strong>24 hours</strong>.
                </p>

                <p className="mb-6 text-gray-600">Please contact your admin to get a new one, or check your email for another invitation.</p>

                <a
                    href="/"
                    className="inline-block rounded bg-yellow-400 px-6 py-3 font-semibold text-black transition duration-200 hover:bg-yellow-300"
                >
                    Go to Homepage
                </a>
            </div>
        </div>
    );
};
export default ExpiredLink;
