const LoadingDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-gray-300 rounded-lg w-64 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96"></div>
        </div>

        {/* KPIs skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-32 bg-gradient-to-r from-gray-300 to-gray-400"></div>
              <div className="p-4 bg-gray-50">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-lg w-48 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded-lg w-64 mb-6"></div>
            <div className="h-80 bg-gray-100 rounded-lg"></div>
          </div>

          {/* Side stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded-lg w-40 mb-6"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-100/50 rounded-lg w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/20 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDashboard;
