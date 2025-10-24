import React from "react";

const Banner = ({
    illustration,
    pattern,
    greeting = "Hi",
    userName = "",
    title = "Welcome to the Dashboard",
    description = "Easily book, manage and track studio gear and equipment. Streamline your studio workflow.",
}) => {
    return (
        <div className="p-1 flex gap-5 justify-between items-center w-full rounded-lg h-50 bg-[#ffc80183] my-4">
            {/* Left image */}
            <div className="imgbanner1 h-full rounded">
                <img
                    src={illustration}
                    alt="illustration"
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
            </div>

            {/* Center text */}
            <div className="infoadmin md:p-3 lp:p-1 flex justify-center items-start flex-col m-0 h-full">
                <span className="">
                    {greeting}<span className="font-bold"> {userName} </span>,
                </span>
                <h1 className="mt-2 md:text-[20px]">{title}</h1>
                <p className="m-0 opacity-80 w-4/5">{description}</p>
            </div>

            {/* Right image */}
            <div className=" h-full">
                <img
                    src={pattern}
                    alt="pattern"
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                />
            </div>
        </div>
    );
};

export default Banner;
