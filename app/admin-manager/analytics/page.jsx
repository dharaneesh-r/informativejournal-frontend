'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const GA_MEASUREMENT_ID = 'G-DG0801N414'; // Your GA4 ID

const AnalyticsDashboard = () => {
  // internal state
  const [timeRange, setTimeRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GA-specific state
  const [gaMetrics, setGaMetrics] = useState(null);
  const [gaLoading, setGaLoading] = useState(false);
  const [gaError, setGaError] = useState(null);

  // Load GA script
  const loadGtag = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (window.gtag) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname
      });
    `;
    document.head.appendChild(script2);
  }, []);

  // Generic event tracker
  const trackEvent = (name, params) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, params);
    }
  };

  // Fetch GA aggregated metrics from backend
  const fetchGAMetrics = useCallback(async () => {
    setGaLoading(true);
    setGaError(null);
    try {
      const res = await fetch(`/api/ga/summary?range=${timeRange}`);
      if (!res.ok) throw new Error(`GA summary fetch failed: ${res.statusText}`);
      const data = await res.json();
      setGaMetrics(data);
    } catch (e) {
      console.error('GA fetch error:', e);
      setGaError(e.message || 'Failed to fetch GA metrics');
      setGaMetrics(null);
    } finally {
      setGaLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadGtag();
  }, [loadGtag]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://informativejournal-backend.vercel.app/articles');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // For debugging

        let articlesArray = [];

        if (Array.isArray(data)) {
          articlesArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          articlesArray = data.data;
        } else if (data.articles && Array.isArray(data.articles)) {
          articlesArray = data.articles;
        } else if (data.results && Array.isArray(data.results)) {
          articlesArray = data.results;
        } else {
          throw new Error('API response does not contain a valid articles array. Received: ' + JSON.stringify(data));
        }

        const validatedArticles = articlesArray.map((article, index) => ({
          id: article.id || article._id || `temp-${index}-${Date.now()}`,
          title: article.title || 'Untitled Article',
          category: article.category || 'Uncategorized',
          publishedAt: article.publishedAt || article.createdAt || article.date || new Date().toISOString(),
          views: Number(article.views) || 0,
          likes: Number(article.likes) || 0,
          comments: Number(article.comments) || 0,
          slug: article.slug || (article.title ? article.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : 'untitled'),
          imageUrl: article.imageUrl || article.image || '/placeholder-article.jpg'
        }));

        setArticles(validatedArticles);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(err.message || 'Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    fetchGAMetrics();
  }, [fetchGAMetrics]);

  const processData = () => {
    if (!Array.isArray(articles) || articles.length === 0) {
      return {
        lineData: [],
        barData: [],
        categoryData: [],
        filteredArticles: []
      };
    }

    const sortedArticles = [...articles].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    const now = new Date();
    let cutoffDate = new Date();

    if (timeRange === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90days') {
      cutoffDate.setDate(now.getDate() - 90);
    } else {
      cutoffDate = new Date(0);
    }

    const filteredArticles = sortedArticles.filter(article =>
      new Date(article.publishedAt) >= cutoffDate
    );

    const lineData = filteredArticles.map(article => ({
      date: new Date(article.publishedAt).toLocaleDateString(),
      views: article.views,
      title: article.title.substring(0, 20) + (article.title.length > 20 ? '...' : '')
    }));

    const barData = [...filteredArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(article => ({
        title: article.title.substring(0, 15) + (article.title.length > 15 ? '...' : ''),
        views: article.views,
        likes: article.likes,
        comments: article.comments
      }));

    const categoryData = filteredArticles.reduce((acc, article) => {
      const existing = acc.find(item => item.name === article.category);
      if (existing) {
        existing.value += 1;
        existing.views += article.views;
      } else {
        acc.push({
          name: article.category,
          value: 1,
          views: article.views
        });
      }
      return acc;
    }, []);

    return { lineData, barData, categoryData, filteredArticles };
  };

  const { lineData, barData, categoryData, filteredArticles } = processData();
  const totalViews = filteredArticles.reduce((sum, article) => sum + article.views, 0);
  const totalLikes = filteredArticles.reduce((sum, article) => sum + article.likes, 0);
  const engagementRate = filteredArticles.length > 0
    ? Math.round((totalLikes / Math.max(totalViews, 1)) * 100)
    : 0;

  const handleArticleClick = (article) => {
    trackEvent('select_content', {
      content_type: 'article',
      item_id: article.id,
      title: article.title,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-600">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium">Error Loading Data</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <div className="mt-4 text-sm text-gray-600">
          <p>Please check:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Your internet connection</li>
            <li>API endpoint availability</li>
            <li>Browser console for more details</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center text-yellow-600">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium">No Data Available</h3>
        </div>
        <p className="mt-2 text-yellow-700">
          {articles.length === 0
            ? "No articles found in the system."
            : "No articles match the selected time range."}
        </p>
        <button
          onClick={() => setTimeRange('all')}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Show All Articles
        </button>
      </div>
    );
  }

  // Derived GA metrics with safe fallbacks
  const gaActiveUsers = gaMetrics?.activeUsers ?? '—';
  const gaSessions = gaMetrics?.sessions ?? '—';
  const gaPageviews = gaMetrics?.pageviews ?? '—';
  const gaEngagementRate = gaMetrics?.engagementRate ?? '—';
  const gaAvgSessionDuration = gaMetrics?.averageSessionDuration ?? '—';
  const gaEventCounts = gaMetrics?.eventCounts || {};

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">News Analytics Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {['7days', '30days', '90days', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' :
                range === '30days' ? 'Last 30 Days' :
                  range === '90days' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-6">
          {/* Internal stats */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
            <p className="text-2xl font-bold text-gray-800">{filteredArticles.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Internal Views</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalViews.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Internal Likes</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalLikes.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Engagement</h3>
            <p className="text-2xl font-bold text-purple-600">
              {engagementRate}%
            </p>
          </div>
          {/* GA metrics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">GA Active Users</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {gaLoading ? '…' : (typeof gaActiveUsers === 'number' ? gaActiveUsers.toLocaleString() : gaActiveUsers)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">GA Sessions</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {gaLoading ? '…' : (typeof gaSessions === 'number' ? gaSessions.toLocaleString() : gaSessions)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">GA Pageviews</h3>
            <p className="text-2xl font-bold text-blue-600">
              {gaLoading ? '…' : (typeof gaPageviews === 'number' ? gaPageviews.toLocaleString() : gaPageviews)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">GA Engagement Rate</h3>
            <p className="text-2xl font-bold text-teal-600">
              {gaLoading ? '…' : (typeof gaEngagementRate === 'number' ? `${Math.round(gaEngagementRate)}%` : gaEngagementRate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg. Session Duration (sec)</h3>
            <p className="text-2xl font-bold text-gray-800">
              {gaLoading ? '…' : (typeof gaAvgSessionDuration === 'number' ? Math.round(gaAvgSessionDuration) : gaAvgSessionDuration)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Tracked Clicks (select_content)</h3>
            <p className="text-2xl font-bold text-orange-600">
              {gaLoading ? '…' : (gaEventCounts.select_content != null ? gaEventCounts.select_content.toLocaleString() : '0')}
            </p>
            <div className="text-xs text-gray-500">Article link clicks tracked as GA events</div>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {['overview', 'articles', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Views Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GA vs internal top pages comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Internal Articles</h2>
                <div className="h-64 overflow-auto">
                  {barData.map((b, i) => (
                    <div key={i} className="flex justify-between py-1 border-b last:border-b-0">
                      <div className="text-sm font-medium">{b.title}</div>
                      <div className="text-sm">{b.views.toLocaleString()} views</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Top GA Pages</h2>
                <div className="h-64 overflow-auto">
                  {gaLoading && <p className="text-sm">Loading GA top pages...</p>}
                  {!gaLoading && gaMetrics && gaMetrics.topPages && gaMetrics.topPages.length ? (
                    gaMetrics.topPages.map((p, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b last:border-b-0">
                        <div className="text-sm font-medium truncate">{p.title || p.path}</div>
                        <div className="text-sm">{p.views.toLocaleString()} views</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No GA top pages available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Articles</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="likes" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Articles by Category</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${props.payload.name}: ${value} articles (${props.payload.views} views)`
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => {
                    const engagementPercentage = article.views
                      ? Math.round((article.likes / article.views) * 100)
                      : 0;

                    return (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={article.imageUrl}
                                alt={article.title}
                                onError={(e) => {
                                  e.target.src = '/placeholder-article.jpg';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                <a
                                  href={`/${article.category}/${article.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 transition-colors"
                                  onClick={() => handleArticleClick(article)}
                                >
                                  {article.title}
                                </a>
                              </div>
                              <div className="text-sm text-gray-500">
                                <a
                                  href={`/${article.category}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {article.category}
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {article.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {article.likes.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {article.comments.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {engagementPercentage}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(engagementPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Views by Category</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={categoryData.sort((a, b) => b.views - a.views)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="views"
                      fill="#8884d8"
                      radius={[0, 4, 4, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h2>
              <div className="space-y-4">
                {categoryData.map((category) => {
                  const percentage = (category.value / filteredArticles.length) * 100;
                  return (
                    <div key={category.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <a
                          href={`/${category.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {category.name}
                        </a>
                        <span>
                          {category.value} articles ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
