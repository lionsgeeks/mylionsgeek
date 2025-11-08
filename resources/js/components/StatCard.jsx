import React from "react";

export default function StatCard({ items = [] }) {
    return (
        <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${items.length % 2 == 0 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            {items.map((item, index) => {
                const { title, number, icon: Icon } = item;
                return (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl
                      bg-gradient-to-br from-yellow-50 to-yellow-100
                      dark:from-yellow-900/20 dark:to-yellow-800/20
                      p-6 border-2 border-yellow-200 dark:border-yellow-600/30
                      hover:border-yellow-400 dark:hover:border-yellow-400
                      transition-all duration-300 hover:scale-105 cursor-pointer
                      shadow-lg hover:shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 dark:bg-yellow-600 rounded-full
                            filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                        />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className={`text-5xl font-black text-yellow-600 dark:text-yellow-400 mb-2`}>
                                    {number}
                                </div>
                                <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider">
                                    {title}
                                </div>
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-yellow-400 dark:bg-yellow-500
                              flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
                            >
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
