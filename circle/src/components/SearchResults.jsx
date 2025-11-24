import UserResultCard from "./UserResultCard";
import GroupResultCard from "./GroupResultCard";
import EventResultCard from "./EventResultCard";

function SearchResults({ results, searchQuery }) {
  const hasResults =
    results.users.length > 0 ||
    results.groups.length > 0 ||
    results.events.length > 0;

  if (!hasResults) {
    return (
      <div className="no-results-message">
        No results found for "{searchQuery}"
      </div>
    );
  }

  return (
    <div className="main-content">
      {results.users.length > 0 && (
        <div className="search-section">
          <h2 className="search-section-header">People</h2>
          <div className="search-results-grid">
            {results.users.map((user) => (
              <UserResultCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {results.groups.length > 0 && (
        <div className="search-section">
          <h2 className="search-section-header">Groups</h2>
          <div className="search-results-grid">
            {results.groups.map((group) => (
              <GroupResultCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {results.events.length > 0 && (
        <div className="search-section">
          <h2 className="search-section-header">Events</h2>
          <div className="search-results-grid">
            {results.events.map((event) => (
              <EventResultCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;
