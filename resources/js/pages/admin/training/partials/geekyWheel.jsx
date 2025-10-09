import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const GeekyWheel = ({showGeekyWheel , setShowGeekyWheel , spinWheel , wheelRotation , isSpinning , wheelParticipants , showWinnerModal , setShowWinnerModal , selectedWinner , continueSpinning , resetWheel , removeWinner}) => {
    return (
        <div>


            {/* Geeky Wheel Modal */}
            <Dialog open={showGeekyWheel} onOpenChange={setShowGeekyWheel}>
                <DialogContent className="max-w-[95vw]  bg-transparent flex items-center  lg:p-8 border-0">


                    <div className="mt-6 flex  flex-col items-center space-y-6">
                        {/* Wheel Container */}
                        <div className="relative">
                            {/* Pointer - positioned at 9 o'clock (left side) - reversed */}
                            <div className="absolute left-0 top-1/2 transform -translate-x-6 -translate-y-1/2 z-10">
                                <div className="w-0 h-0 border-t-[20px] border-b-[20px] border-l-[40px] border-t-transparent border-b-transparent border-l-alpha drop-shadow-lg"></div>
                            </div>

                            {/* Wheel */}
                            <div
                                className={`relative w-[400px] h-full  lg:w-[500px] lg:h-[500px]  cursor-pointer transition-all duration-300 ${!isSpinning ? 'hover:scale-105' : ''} ${isSpinning ? 'cursor-not-allowed' : ''}`}
                                onClick={spinWheel}
                            >
                                <svg
                                    className="w-full h-full drop-shadow-2xl"
                                    style={{
                                        transform: `rotate(${wheelRotation}deg)`,
                                        transition: isSpinning ? 'transform 5s cubic-bezier(0.23, 1, 0.32, 1)' : 'transform 0.3s ease'
                                    }}
                                    viewBox="0 0 200 200"
                                >
                                    {wheelParticipants.map((participant, index) => {
                                        const angle = (360 / wheelParticipants.length) * index;
                                        const nextAngle = (360 / wheelParticipants.length) * (index + 1);
                                        const midAngle = (angle + nextAngle) / 2;

                                        // Alternating colors
                                        const isYellow = index % 2 === 0;
                                        const color = isYellow ? '#ffc801' : '#171717';

                                        // Calculate path for segment
                                        const startAngleRad = (angle * Math.PI) / 180;
                                        const endAngleRad = (nextAngle * Math.PI) / 180;
                                        const largeArcFlag = nextAngle - angle <= 180 ? "0" : "1";

                                        const x1 = 100 + 85 * Math.cos(startAngleRad);
                                        const y1 = 100 + 85 * Math.sin(startAngleRad);
                                        const x2 = 100 + 85 * Math.cos(endAngleRad);
                                        const y2 = 100 + 85 * Math.sin(endAngleRad);

                                        const pathData = [
                                            `M 100 100`,
                                            `L ${x1} ${y1}`,
                                            `A 85 85 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                            `Z`
                                        ].join(' ');

                                        // Text position
                                        const textAngleRad = (midAngle * Math.PI) / 180;
                                        const textX = 100 + 55 * Math.cos(textAngleRad);
                                        const textY = 100 + 55 * Math.sin(textAngleRad);

                                        return (
                                            <g key={participant.id}>
                                                <path
                                                    d={pathData}
                                                    fill={color}
                                                    stroke="#fff"
                                                    strokeWidth="1"
                                                    className="transition-all duration-200"
                                                />
                                                <text
                                                    x={textX}
                                                    y={textY}
                                                    fill={isYellow ? "#000000" : "#ffffff"}
                                                    fontSize="6"
                                                    // fontWeight=""
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                                                >
                                                    {participant.name}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Center circle */}
                                    <circle cx="100" cy="100" r="18" fill="#171717" stroke="#ffc801" strokeWidth="3" />
                                    <circle cx="100" cy="100" r="8" fill="#ffc801" />
                                </svg>
                            </div>
                        </div>

                        {/* Participants Count */}
                        <div className="text-center mt-6">
                            <p className="text-lg font-semibold text-dark dark:text-light">
                                Participants remaining: <span className="text-alpha font-bold text-2xl">{wheelParticipants.length}</span>
                            </p>
                        </div>

                    </div>


                </DialogContent>
            </Dialog>

            {/* Winner Modal */}
            <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
                <DialogContent className="max-w-md bg-light dark:bg-dark border border-alpha/20">

                    {selectedWinner && (
                        <div className="mt-6 text-center">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-alpha text-dark flex items-center justify-center font-bold text-3xl">
                                    {selectedWinner.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-dark dark:text-light">{selectedWinner.name}</p>
                                    <p className="text-alpha font-semibold">Congratulations!</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col space-y-3">
                        <button
                            onClick={continueSpinning}
                            className="w-full px-6 py-3 bg-alpha text-dark rounded-xl font-bold text-lg hover:bg-alpha/90 transition-all duration-300"
                        >
                            Continue Spinning
                        </button>

                        <button
                            onClick={removeWinner}
                            className="w-full px-6 py-3 bg-error text-light rounded-xl font-bold text-lg hover:bg-error/90 transition-all duration-300"
                        >
                            Remove Winner
                        </button>

                        <button
                            onClick={resetWheel}
                            className="w-full px-6 py-3 border border-alpha/30 text-dark dark:text-light rounded-xl font-bold text-lg hover:bg-alpha/10 transition-all duration-300"
                        >
                            Reset Wheel
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default GeekyWheel;