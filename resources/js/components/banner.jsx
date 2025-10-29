import pattern_default from '../../../public/assets/images/banner/pattern.png';

const Banner = ({
    size = 300,
    illustration,
    pattern = pattern_default,
    greeting = 'Hi',
    userName = '',
    title = 'Welcome to the Dashboard',
    description = 'Easily book, manage and track studio gear and equipment. Streamline your studio workflow.',
}) => {
    return (
        <div className="my-4 flex h-50 w-full items-center justify-between gap-5 rounded-lg bg-[#ffc80183] px-5 py-2">
            {/* Left image */}
            <div className="imgbanner1 h-full rounded">
                <img width={size} src={illustration} alt="illustration" loading="lazy" className="h-full object-cover object-center" />
            </div>

            {/* Center text */}
            <div className="infoadmin lp:p-1 m-0 flex h-full flex-col items-start justify-center md:p-3">
                <span className="">
                    {greeting}
                    <span className="font-bold"> {userName} </span>,
                </span>
                <h1 className="mt-2 md:text-[20px]">{title}</h1>
                <p className="m-0 w-4/5 opacity-80">{description}</p>
            </div>

            {/* Right image */}
            <div className="h-full">
                <img src={pattern} alt="pattern" loading="lazy" className="h-full w-full object-cover object-center" />
            </div>
        </div>
    );
};

export default Banner;
