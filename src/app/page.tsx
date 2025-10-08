"use client";

import { useEffect, useState } from "react";
import type { Advocate, AdvocatesResponse } from "../types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        console.log("fetching advocates...");
        const response = await fetch("/api/advocates");

        if (!response.ok) {
          throw new Error(`Failed to fetch advocates: ${response.statusText}`);
        }

        const jsonResponse: AdvocatesResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load advocates";
        setError(errorMessage);
        console.error("Error fetching advocates:", err);
      }
    };

    fetchAdvocates();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchTerm(search);

    console.log("filtering advocates...");
    const searchLower = search.toLowerCase();

    const filtered = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(searchLower) ||
        advocate.lastName.toLowerCase().includes(searchLower) ||
        advocate.city.toLowerCase().includes(searchLower) ||
        advocate.degree.toLowerCase().includes(searchLower) ||
        advocate.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchLower)
        ) ||
        advocate.yearsOfExperience.toString().includes(search) ||
        advocate.phoneNumber.toString().includes(search)
      );
    });

    setFilteredAdvocates(filtered);
  };

  const onClick = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
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
        </p>
        <input
          style={{ border: "1px solid black" }}
          value={searchTerm}
          onChange={onChange}
        />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
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
          {filteredAdvocates.map((advocate, index) => {
            return (
              <tr key={advocate.id ?? index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{advocate.firstName}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.lastName}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.city}</td>
                <td className="border border-gray-300 px-4 py-2">{advocate.degree}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {advocate.specialties.map((s, i) => (
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
