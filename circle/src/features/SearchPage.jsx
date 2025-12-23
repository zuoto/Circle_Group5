import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { performSearch } from "../services/SearchService";
import SearchResults from "../components/SearchResults";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [results, setResults] = useState({
    users: [],
    groups: [],
    events: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const executeSearch = async () => {
      if (searchQuery.trim().length > 0) {
        setLoading(true);
        try {
          const searchResults = await performSearch(searchQuery);

          setResults(searchResults);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ users: [], groups: [], events: [] });
      }
    };

    executeSearch();
  }, [searchQuery]);

  return (
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Search Results</div>
        {searchQuery && (
          <p className="search-query-text">Results for "{searchQuery}"</p>
        )}
      </div>

      {loading && <div className="loading-message">Searching...</div>}

      {!loading && searchQuery && (
        <SearchResults results={results} searchQuery={searchQuery} />
      )}
    </div>
  );
}

export default SearchPage;
