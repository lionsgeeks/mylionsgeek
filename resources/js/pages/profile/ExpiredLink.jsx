import React from 'react';

const ExpiredLink = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full border-t-4 border-yellow-400 text-center">

                <div className="text-5xl mb-4 text-yellow-400">⚠️</div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                    This Link Has Expired
                </h1>

                <p className="text-gray-600 mb-4 text-base md:text-lg">
                    Oops! Your profile completion link is no longer valid. For security, links expire after <strong>24 hours</strong>.
                </p>

                <p className="text-gray-600 mb-6">
                    Please contact your admin to get a new one, or check your email for another invitation.
                </p>

                <a
                    href="/"
                    className="inline-block bg-yellow-400 text-black font-semibold px-6 py-3 rounded hover:bg-yellow-300 transition duration-200"
                >
                    Go to Homepage
                </a>
            </div>
        </div>
    );
};
export default ExpiredLink;