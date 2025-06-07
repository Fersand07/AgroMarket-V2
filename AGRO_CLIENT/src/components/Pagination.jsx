const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center mt-6 space-x-4">
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)} className="px-4 py-1 bg-gray-300  rounded shadow-xs transition transform duration-200">
          Previous
        </button>
      )}
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-4 py-2 rounded transition transform duration-200 hover:scale-110 ${
            i + 1 === currentPage ? 'bg-altLight text-white' : 'bg-gray-300 shadow-xs'
          }`}
        >
          {i + 1}
        </button>
      ))}
      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)} className="px-5 py-1 bg-gray-300  rounded shadow-xs transition transform duration-200">
          Next
        </button>
      )}
    </div>
  );
};

export default Pagination;
