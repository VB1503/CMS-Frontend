import React from 'react';

const FertilizerRecommendationResult = () => {
    return (
        <div className="flex-1 min-w-0 w-full md:w-1/2 mt-12 md:mt-0 bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg md:rounded-none shadow-lg md:shadow-none border-2 border-amber-200 md:border-none flex flex-col justify-start md:justify-center">
            <h2 className="text-2xl font-bold text-amber-700 mb-4 text-center">⚠️ Soil Amendment Recommendations</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500 overflow-hidden">
                <p className="text-gray-700 font-semibold mb-4 text-center break-words">The N value of soil is high and might give rise to weeds. Please consider the following suggestions:</p>
                <ol className="list-decimal pl-6 space-y-3 text-gray-700 leading-relaxed overflow-x-hidden">
                    <li className="break-words">
                        <span className="font-semibold text-amber-700">Manure</span> – adding manure is one of the simplest ways to amend your soil with nitrogen. Be careful as there are various types of manures with varying degrees of nitrogen.
                    </li>
                    <li className="break-words">
                        <span className="font-semibold text-amber-700">Coffee grinds</span> – use your morning addiction to feed your gardening habit! Coffee grinds are considered a green compost material which is rich in nitrogen. Once the grounds break down, your soil will be fed with nitrogen. An added benefit is it helps provide increased drainage to your soil.
                    </li>
                    <li className="break-words">
                        <span className="font-semibold text-amber-700">Plant nitrogen fixing plants</span> – planting vegetables in the Fabaceae family like peas, beans and soybeans have the ability to increase nitrogen in your soil.
                    </li>
                    <li className="break-words">
                        <span className="font-semibold text-amber-700">Plant 'green manure' crops</span> – like cabbage, corn and broccoli.
                    </li>
                    <li className="break-words">
                        <span className="font-semibold text-amber-700">Use mulch</span> – wet grass while growing crops. Mulch can also include sawdust and scrap soft woods.
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default FertilizerRecommendationResult;
