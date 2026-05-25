const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = require('./config/prisma');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with Prisma...');
    console.log('');

    // Clear existing data
    await prisma.user.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.blog.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.experience.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@portfolio.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      }
    });
    console.log('✅ Admin user created');

    // Create profile
    await prisma.profile.create({
      data: {
        name: 'Rido Rifki Hakim',
        title: 'Full Stack Web Developer',
        email: 'ridorifkihakim@gmail.com',
        phone: '+62 858-8867-3602',
        birthday: 'April 18',
        location: 'Bekasi, Jawa Barat, Indonesia',
        avatar: '',
        bio: 'I am a Web Developer who also has deep expertise in Web Design, Mobile App Development, and Software QA Testing. With a strong technical background and a keen attention to detail, I am committed to creating digital solutions that are not only aesthetically pleasing and user-friendly but also robust in terms of performance and functionality.',
        social: {
          github: 'https://github.com/ridorifki',
          linkedin: 'https://linkedin.com/in/ridorifki',
          twitter: 'https://twitter.com/ridorifki',
          instagram: 'https://instagram.com/ridorifki'
        }
      }
    });
    console.log('✅ Profile created');

    // Create skills
    const skills = [
      { name: 'JavaScript', level: 95, icon: '⚡', color: '#F7DF1E', category: 'frontend' },
      { name: 'React', level: 90, icon: '⚛️', color: '#61DAFB', category: 'frontend' },
      { name: 'Node.js', level: 85, icon: '🟢', color: '#339933', category: 'backend' },
      { name: 'MongoDB', level: 80, icon: '🍃', color: '#47A248', category: 'database' },
      { name: 'Express.js', level: 85, icon: '🚂', color: '#000000', category: 'backend' },
      { name: 'TypeScript', level: 80, icon: '📘', color: '#3178C6', category: 'frontend' },
      { name: 'CSS/SCSS', level: 90, icon: '🎨', color: '#264de4', category: 'frontend' },
      { name: 'Git', level: 85, icon: '📦', color: '#F05032', category: 'tools' },
      { name: 'Docker', level: 75, icon: '🐳', color: '#2496ED', category: 'tools' },
      { name: 'PostgreSQL', level: 75, icon: '🐘', color: '#4169E1', category: 'database' }
    ];
    
    for (const skill of skills) {
      await prisma.skill.create({ data: skill });
    }
    console.log('✅ Skills created');

    // Create education
    const education = [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        period: '2016 - 2020',
        description: 'Focused on software engineering, data structures, algorithms, and web development. Graduated with honors and completed several practical projects.',
        order: 1
      },
      {
        degree: 'Full Stack Web Development Bootcamp',
        institution: 'Tech Academy Indonesia',
        period: '2020',
        description: 'Intensive 6-month program covering modern web technologies including React, Node.js, Express, MongoDB, and deployment practices.',
        order: 2
      }
    ];
    
    for (const edu of education) {
      await prisma.education.create({ data: edu });
    }
    console.log('✅ Education created');

    // Create experience
    const experience = [
      {
        position: 'Senior Full Stack Developer',
        company: 'Tech Innovations Inc.',
        period: '2022 - Present',
        description: 'Leading development of enterprise web applications using MERN stack. Mentoring junior developers, implementing CI/CD pipelines, and ensuring code quality through reviews and testing.',
        order: 1
      },
      {
        position: 'Full Stack Developer',
        company: 'Digital Solutions Ltd.',
        period: '2020 - 2022',
        description: 'Developed and maintained multiple client projects using React and Node.js. Collaborated with design team to create responsive and user-friendly interfaces. Improved application performance by 40%.',
        order: 2
      },
      {
        position: 'Junior Web Developer',
        company: 'StartUp Hub',
        period: '2019 - 2020',
        description: 'Built responsive websites and landing pages using HTML, CSS, JavaScript, and React. Gained experience in version control with Git and agile development practices.',
        order: 3
      }
    ];

    for (const exp of experience) {
      await prisma.experience.create({ data: exp });
    }
    console.log('✅ Experience created');

    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    console.log('==========================================');
    console.log('📝 ADMIN LOGIN CREDENTIALS:');
    console.log('==========================================');
    console.log('Email:    admin@portfolio.com');
    console.log('Password: admin123');
    console.log('==========================================');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();