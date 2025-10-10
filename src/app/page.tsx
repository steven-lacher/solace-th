"use client";

import { useEffect, useState } from "react";
import type { Advocate } from "../types/advocate";
import { useDebounce } from "../hooks/useDebounce";

interface PaginatedResponse {
  data: Advocate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term by 500ms - reduces API calls by ~80%
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAdvocates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters for server-side search & pagination
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
          ...(debouncedSearch && { search: debouncedSearch }),
        });

        console.log(`Fetching advocates: page=${currentPage}, search="${debouncedSearch}"`);
        const response = await fetch(`/api/advocates?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch advocates: ${response.statusText}`);
        }

        const jsonResponse: PaginatedResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setTotalPages(jsonResponse.totalPages);
        setTotal(jsonResponse.total);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, ignore
          return;
        }
        const errorMessage = err instanceof Error ? err.message : "Failed to load advocates";
        setError(errorMessage);
        console.error("Error fetching advocates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();

    // Cleanup: abort request if search term or page changes before completion
    return () => controller.abort();
  }, [debouncedSearch, currentPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Format search term display to show friendly message for years searches
  const getSearchDisplayText = (term: string): string => {
    const yearsMatch = term.match(/^(\d+)\s*(year|yr|yrs|years)(\s+of\s+experience)?$/i);
    if (yearsMatch) {
      return `${yearsMatch[1]} or more years of experience`;
    }
    return term;
  };

  const onPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const onNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Serif Typography */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Find Your Advocate
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with healthcare advocates who will help untangle your healthcare—covered by Medicare.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Search Bar - Solace Style */}
        <div className="mb-8 max-w-3xl mx-auto">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search by name, city, degree, specialty, phone number, or years of experience
          </label>
          <div className="flex gap-3">
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={onSearchChange}
              disabled={loading}
              placeholder="Search advocates..."
              className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={onReset}
              disabled={loading}
              className="px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Reset
            </button>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-600">
              Searching for: <span className="font-medium text-gray-900">{getSearchDisplayText(searchTerm)}</span>
            </p>
          )}
        </div>

        {/* Loading Indicator - Better Placement */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="animate-spin h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Loading advocates...</span>
            </div>
          </div>
        )}

        {/* Results Count and Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{advocates.length}</span> of{" "}
            <span className="font-medium text-gray-900">{total}</span> advocates
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1 || loading}
              className="px-5 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
              <span className="font-medium text-gray-900">{totalPages}</span>
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages || loading}
              className="px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>

        {/* Card Grid - Solace Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advocates.map((advocate: Advocate, index: number) => (
            <div
              key={advocate.id ?? index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
            >
              {/* Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {advocate.firstName} {advocate.lastName}
              </h3>

              {/* Degree Badge */}
              <div className="inline-block mb-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  {advocate.degree}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Location:</span>
                  <span className="text-gray-900 text-sm font-medium">{advocate.city}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Experience:</span>
                  <span className="text-gray-900 text-sm font-medium">{advocate.yearsOfExperience} years</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-sm min-w-[80px]">Phone:</span>
                  <span className="text-gray-900 text-sm font-medium">{advocate.phoneNumber}</span>
                </div>
              </div>

              {/* Specialties */}
              {advocate.specialties.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {advocate.specialties.map((specialty: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-full transition-colors shadow-sm">
                Connect with Advocate
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && advocates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No advocates found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </main>
  );
}
