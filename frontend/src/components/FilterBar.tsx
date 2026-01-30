import { useState, useEffect } from 'react';

interface FilterBarProps {
    placeholder?: string;
    onFilterChange: (filters: { search: string; status: string }) => void;
    statusOptions?: string[];
}

const FilterBar = ({
    placeholder = "Search...",
    onFilterChange,
    statusOptions = []
}: FilterBarProps) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search, status });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status, onFilterChange]);

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                />
            </div>

            {statusOptions.length > 0 && (
                <div className="w-full sm:w-48">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
