const BlogSection = ({ blogs = [] }) => {
  // Fallback dummy data jika blogs kosong
  const blogPosts = blogs.length > 0 ? blogs : [
    {
      _id: 1,
      title: 'Getting Started with React Hooks',
      category: 'React',
      date: 'January 15, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/61dafb?text=React+Hooks',
      excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components.',
      readTime: '5 min read'
    },
    {
      _id: 2,
      title: 'Building RESTful APIs with Node.js',
      category: 'Backend',
      date: 'January 10, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/339933?text=Node.js+API',
      excerpt: 'A comprehensive guide to creating robust and scalable RESTful APIs using Express.js.',
      readTime: '8 min read'
    },
    {
      _id: 3,
      title: 'CSS Grid vs Flexbox: When to Use Each',
      category: 'CSS',
      date: 'January 5, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/264de4?text=CSS+Layout',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox and when to use each layout system.',
      readTime: '6 min read'
    }
  ];

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper untuk mendapatkan URL gambar - FIXED untuk Vite
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x250/2a2a2a/ffa500?text=No+Image';
    if (image.startsWith('http')) return image;
    
    // Gunakan import.meta.env untuk Vite
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${image}`;
  };

  return (
    <section className="content-section">
      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post._id} className="blog-card">
            <div className="blog-image">
              <img src={getImageUrl(post.image)} alt={post.title} />
              <span className="blog-category">{post.category}</span>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-date">📅 {post.date ? formatDate(post.date) : post.date}</span>
                <span className="blog-read-time">⏱️ {post.readTime}</span>
              </div>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <button className="blog-read-more">
                Read More →
              </button>
            </div>
          </article>
        ))}
      </div>
      
      {blogPosts.length === 0 && (
        <div className="empty-state">
          <p>No blog posts available yet.</p>
        </div>
      )}
    </section>
  );
};

export default BlogSection;