const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Getting Started with React Hooks',
      category: 'React',
      date: 'January 15, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/61dafb?text=React+Hooks',
      excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components.',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Building RESTful APIs with Node.js',
      category: 'Backend',
      date: 'January 10, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/339933?text=Node.js+API',
      excerpt: 'A comprehensive guide to creating robust and scalable RESTful APIs using Express.js.',
      readTime: '8 min read'
    },
    {
      id: 3,
      title: 'CSS Grid vs Flexbox: When to Use Each',
      category: 'CSS',
      date: 'January 5, 2024',
      image: 'https://via.placeholder.com/400x250/2a2a2a/264de4?text=CSS+Layout',
      excerpt: 'Understanding the differences between CSS Grid and Flexbox and when to use each layout system.',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Introduction to TypeScript',
      category: 'TypeScript',
      date: 'December 28, 2023',
      image: 'https://via.placeholder.com/400x250/2a2a2a/3178c6?text=TypeScript',
      excerpt: 'Discover how TypeScript can improve your JavaScript development with static typing.',
      readTime: '7 min read'
    },
    {
      id: 5,
      title: 'MongoDB Aggregation Pipeline Explained',
      category: 'Database',
      date: 'December 20, 2023',
      image: 'https://via.placeholder.com/400x250/2a2a2a/47a248?text=MongoDB',
      excerpt: 'Master the MongoDB aggregation pipeline to perform complex data transformations.',
      readTime: '10 min read'
    },
    {
      id: 6,
      title: 'Responsive Design Best Practices',
      category: 'Design',
      date: 'December 15, 2023',
      image: 'https://via.placeholder.com/400x250/2a2a2a/ec4899?text=Responsive+Design',
      excerpt: 'Learn the essential techniques for creating websites that look great on all devices.',
      readTime: '6 min read'
    }
  ];

  return (
    <section className="content-section">
      {/* <h2 className="section-title">Blog</h2> */}
      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post.id} className="blog-card">
            <div className="blog-image">
              <img src={post.image} alt={post.title} />
              <span className="blog-category">{post.category}</span>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-date">📅 {post.date}</span>
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
    </section>
  );
};

export default BlogSection;