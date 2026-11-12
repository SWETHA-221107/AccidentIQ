
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Newspaper,
  Clock3,
  Search,
} from "lucide-react";

const NEWS_API = "http://localhost:8080/api/news/road-safety";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function RoadSafetyNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadNews = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(NEWS_API, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `News service returned an error (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The news service returned an unexpected response.");
      }

      setArticles(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the news service. Check that the backend is running and has internet access."
          : err.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return articles;

    return articles.filter((article) =>
      `${article.title} ${article.source} ${article.description}`
        .toLowerCase()
        .includes(query)
    );
  }, [articles, search]);

  return (
    <section className="news-workspace">
      <div className="news-summary-grid">
        <div className="news-summary-card">
          <div className="news-summary-icon">
            <Newspaper size={20} />
          </div>
          <span>Articles loaded</span>
          <strong>{articles.length}</strong>
        </div>

        <div className="news-summary-card">
          <div className="news-summary-icon">
            <Clock3 size={20} />
          </div>
          <span>Last refreshed</span>
          <strong className="news-refresh-time">
            {lastUpdated
              ? lastUpdated.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </strong>
        </div>
      </div>

      <div className="panel news-panel">
        <div className="panel-heading news-heading">
          <div>
            <h3>Road Safety News</h3>
            <p>
              Recent road accidents, traffic safety updates and transport news
              related to Chennai.
            </p>
          </div>

          <button
            className="subtle-button"
            onClick={() => loadNews(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "news-spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="news-toolbar">
          <label className="search-box news-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search headlines or sources..."
            />
          </label>

          <span className="news-result-count">
            {filteredArticles.length} article(s)
          </span>
        </div>

        <div className="news-disclaimer">
          <AlertTriangle size={17} />
          <p>
            News headlines are collected from Google News RSS and linked to
            their original publishers. They are not verified emergency alerts
            or official live traffic updates.
          </p>
        </div>

        {loading ? (
          <div className="news-state">
            <RefreshCw size={23} className="news-spinning" />
            <strong>Loading road safety news...</strong>
            <span>Fetching the latest available headlines.</span>
          </div>
        ) : error ? (
          <div className="news-state news-error">
            <AlertTriangle size={25} />
            <strong>Unable to load news</strong>
            <span>{error}</span>
            <button
              className="subtle-button"
              onClick={() => loadNews(true)}
              disabled={refreshing}
            >
              Try again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="news-state">
            <Newspaper size={25} />
            <strong>No articles found</strong>
            <span>
              Try another search or refresh the news feed later.
            </span>
          </div>
        ) : (
          <div className="news-article-list">
            {filteredArticles.map((article, index) => (
              <article
                className="news-article"
                key={`${article.link}-${index}`}
              >
                <div className="news-article-top">
                  <span className="news-source">{article.source}</span>
                  <span className="news-date">
                    <Clock3 size={13} />
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <h4>{article.title}</h4>

                <p className="news-description">
                  {article.description ||
                    "Open the original report to read more details."}
                </p>

                <a
                  className="news-read-link"
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read original article
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        )}

        {lastUpdated && !loading && (
          <p className="news-updated-note">
            Feed checked at {lastUpdated.toLocaleString("en-IN")}.
          </p>
        )}
      </div>
    </section>
  );
}
