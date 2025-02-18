const PageNotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen flex-col text-center text-gray-600 space-y-4 p-4 dark:bg-gray-800 dark:text-gray-200 max-w-lg mx-auto">
      <h1 className="text-8xl font-bold text-gray-800">404</h1>
      <h1 className="text-4xl font-bold text-gray-800">Page Not Found</h1>
      <p>
        The page you are looking for might have been removed, had its name
        changed or is temporarily unavailable.
      </p>
    </div>
  );
};

export default PageNotFound;
