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

  const onPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const onNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      {error && (
        <div style={{ color: "red", marginBottom: "16px" }}>
          Error: {error}
        </div>
      )}
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
          {loading && <span> (Loading...)</span>}
        </p>
        <input
          style={{ border: "1px solid black" }}
          value={searchTerm}
          onChange={onSearchChange}
          disabled={loading}
        />
        <button onClick={onReset} disabled={loading}>Reset Search</button>
      </div>
      <br />

      {/* Pagination Controls */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1 || loading}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages} ({total} total results)
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages || loading}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">First Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Last Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">City</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Degree</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Specialties</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Years of Experience</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {advocates.map((advocate: Advocate, index: number) => {
            return (
              <tr key={advocate.id ?? index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{advocate.firstName}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.lastName}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.city}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.degree}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {advocate.specialties.map((s: string, i: number) => (
                    <div key={i}>{s}</div>
                  ))}
                </td>
                <td className="border border-gray-300 px-4 py-2">{advocate.yearsOfExperience}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
