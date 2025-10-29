export default function AppLogoIcon({ size, color }) {
    return (
        <svg
            className="invert dark:invert-0"
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            width={size ? size : '50'}
            height={size ? size : '50'}
            viewBox="0 0 301.000000 302.000000"
            preserveAspectRatio="xMidYMid meet"
        >
            <g transform="translate(0.000000,325.000000) scale(0.100000,-0.100000)" fill={color ? color : '#000'} stroke="none">
                <path
                    d="M705 3008 c-41 -120 -475 -1467 -475 -1474 1 -9 1238 -910 1257 -916
6 -2 294 203 640 454 l631 458 -84 257 c-46 142 -154 477 -241 745 l-158 488
-783 0 c-617 0 -784 -3 -787 -12z m1265 -412 c0 -3 65 -205 145 -451 80 -245
145 -448 145 -450 0 -2 -173 -130 -384 -283 l-384 -280 -384 279 c-283 207
-382 284 -380 297 5 22 283 875 289 885 4 7 953 10 953 3z"
                />
                <path
                    d="M1176 1661 c21 -15 101 -74 178 -130 l139 -101 31 23 c17 13 92 68
166 122 74 54 139 102 144 106 6 5 -145 9 -344 9 l-354 0 40 -29z"
                />
            </g>
        </svg>
    );
}
