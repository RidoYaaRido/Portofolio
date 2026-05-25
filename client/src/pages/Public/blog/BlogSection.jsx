import { getBaseUrl } from '../../../services/api';
import { translateText, dictionary } from '../../../utils/translationHelper';

const BlogSection = ({ blogs = [], lang = 'id' }) => {
  const blogPosts = blogs;

  // Helper untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper untuk mendapatkan URL gambar - FIXED untuk Vite
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x250/2a2a2a/ffa500?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${getBaseUrl()}${image}`;
  };

  return (
    <section className="content-section">
      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post._id} className="blog-card">
            <div className="blog-image">
              <img src={getImageUrl(post.image)} alt={translateText(post.title, lang)} />
              <span className="blog-category">{translateText(post.category, lang)}</span>
            </div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-date">📅 {post.createdAt ? formatDate(post.createdAt) : ''}</span>
                <span className="blog-read-time">⏱️ {translateText(post.readTime, lang)}</span>
              </div>
              <h3 className="blog-title">{translateText(post.title, lang)}</h3>
              <p className="blog-excerpt">{translateText(post.excerpt, lang)}</p>
              <button className="blog-read-more">
                {dictionary[lang].readMore} →
              </button>
            </div>
          </article>
        ))}
      </div>
      
      {blogPosts.length === 0 && (
        <div className="empty-state">
          <p>{dictionary[lang].noBlogs}</p>
        </div>
      )}
    </section>
  );
};

export default BlogSection;