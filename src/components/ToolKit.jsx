import React from 'react';

const ToolKit = ({ tools }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">工具箱</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools && tools.map((tool) => (
          <div
            key={tool.id}
            className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-4">
              {tool.icon}
              <h3 className="text-xl font-semibold text-gray-800">{tool.name}</h3>
            </div>
            <p className="text-gray-600">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolKit;
