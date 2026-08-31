import { useEffect, useState } from 'react';

type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  stack: string[];
  images: string[];
};

const navSections = ['hero', 'about', 'skills', 'projects', 'contact'];

const skills = [
  {
    title: 'Frontend Development',
    items: ['React', 'TypeScript', 'Responsive UI', 'Design Systems'],
  },
  {
    title: 'Backend & APIs',
    items: ['Node.js', 'REST APIs', 'Database Design', 'Authentication'],
  },
  {
    title: 'Product Thinking',
    items: ['User Research', 'UX Strategy', 'Performance Optimization', 'Agile Delivery'],
  },
];

const defaultProjects: Project[] = [
  {
    id: 1,
    title: 'DogGo',
    category: 'Pet adoption platform',
    description:
      'A polished digital experience built to help people connect with pets in need of homes, with a clear journey from browsing to adoption.',
    stack: ['React', 'UX Design', 'Product Strategy'],
    images: ['/DogGo_2.jpg', '/DogGo_3.png', '/DogGo_4.jpg'],
  },
  {
    id: 2,
    title: 'Farm Villa',
    category: 'Property marketplace',
    description:
      'A high-end real estate experience focused on premium listings, search, and trust-building brand storytelling.',
    stack: ['Brand Design', 'Frontend', 'Conversion UX'],
    images: ['/Farm_Villa2.png', '/Farm_Villa3.png'],
  },
  {
    id: 3,
    title: 'Until Sunrise',
    category: 'Lifestyle brand platform',
    description:
      'A concept-driven landing experience aimed at storytelling, customer engagement, and immersive visual presentation.',
    stack: ['Art Direction', 'Web Design', 'Responsive Layout'],
    images: ['/UntilSunrise_2.png', '/UntilSunrise_3.jpg'],
  },
  {
    id: 4,
    title: 'E-Laura',
    category: 'Digital portfolio experience',
    description:
      'A modern personal brand website that balances creative visuals with functional content and a strong professional identity.',
    stack: ['Portfolio Design', 'Content Strategy', 'Web Build'],
    images: ['/E-Laura3.png', '/E-Laura2.jpg'],
  },
];

const profileImage = '/Me_3.jpg';

const emptyForm = {
  title: '',
  category: '',
  description: '',
  stack: '',
  images: '/DogGo_2.jpg, /DogGo_3.png',
};

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [portfolioItems, setPortfolioItems] = useState<Project[]>(defaultProjects);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState(emptyForm);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<number, number>>({});
  const [fullscreenProjectId, setFullscreenProjectId] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      for (const section of navSections) {
        const element = document.getElementById(section);
        if (!element) continue;

        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openManager = () => {
    setIsManagerOpen(true);
  };

  const closeManager = () => {
    setIsManagerOpen(false);
    setEditingId(null);
    setFormState(emptyForm);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormState(emptyForm);
    setIsManagerOpen(true);
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setFormState({
      title: project.title,
      category: project.category,
      description: project.description,
      stack: project.stack.join(', '),
      images: project.images.join(', '),
    });
    setIsManagerOpen(true);
  };

  const handleDelete = (projectId: number) => {
    setPortfolioItems((current) => current.filter((project) => project.id !== projectId));
    if (editingId === projectId) {
      closeManager();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = formState.title.trim();
    const nextCategory = formState.category.trim();
    const nextDescription = formState.description.trim();
    const nextImages = formState.images
      .split(',')
      .map((image) => image.trim())
      .filter(Boolean);
    const nextStack = formState.stack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nextTitle || !nextCategory || !nextDescription || nextImages.length === 0) {
      return;
    }

    if (editingId !== null) {
      setPortfolioItems((current) =>
        current.map((project) =>
          project.id === editingId
            ? { ...project, title: nextTitle, category: nextCategory, description: nextDescription, stack: nextStack, images: nextImages }
            : project,
        ),
      );
    } else {
      const newProject: Project = {
        id: Date.now(),
        title: nextTitle,
        category: nextCategory,
        description: nextDescription,
        stack: nextStack,
        images: nextImages,
      };

      setPortfolioItems((current) => [newProject, ...current]);
    }

    closeManager();
  };

  const updateActiveImage = (projectId: number, direction: number) => {
    setPortfolioItems((current) => {
      const project = current.find((item) => item.id === projectId);
      if (!project || project.images.length <= 1) return current;

      setActiveImageIndex((currentIndexState) => {
        const currentIndex = currentIndexState[projectId] ?? 0;
        const nextIndex = (currentIndex + direction + project.images.length) % project.images.length;
        return { ...currentIndexState, [projectId]: nextIndex };
      });

      return current;
    });
  };

  const setProjectImage = (projectId: number, imageIndex: number) => {
    setActiveImageIndex((current) => ({ ...current, [projectId]: imageIndex }));
  };

  const openFullscreenProject = (projectId: number) => {
    setFullscreenProjectId(projectId);
  };

  const closeFullscreenProject = () => {
    setFullscreenProjectId(null);
  };

  return (
    <div className="portfolio-app">
      <header className="topbar">
        <div className="container nav-shell">
          <button type="button" className="brand" onClick={() => scrollToSection('hero')}>
            AM
          </button>

          <nav className="nav" aria-label="Main navigation">
            {navSections.map((section) => (
              <button
                key={section}
                type="button"
                className={`nav-link ${activeSection === section ? 'active' : ''}`}
                onClick={() => scrollToSection(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </nav>

          <button type="button" className="nav-cta" onClick={() => scrollToSection('contact')}>
            Let’s Talk
          </button>
        </div>
      </header>

      <main>
        <section id="hero" className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Full-Stack Developer • Product Designer</p>
              <h1>I build elegant digital experiences that help brands grow and users connect.</h1>
              <p className="lead">
                I’m Alex Morgan, a product-minded developer focused on creating clean, scalable,
                conversion-driven web apps for startups, businesses, and personal brands.
              </p>

              <div className="hero-actions">
                <button type="button" className="button primary" onClick={() => scrollToSection('projects')}>
                  View Projects
                </button>
                <button type="button" className="button secondary" onClick={() => scrollToSection('contact')}>
                  Contact Me
                </button>
              </div>

              <div className="stat-row">
                <div>
                  <strong>5+</strong>
                  <span>Years experience</span>
                </div>
                <div>
                  <strong>18</strong>
                  <span>Projects shipped</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>Client focus</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="profile-panel">
                <img src={profileImage} alt="Alex Morgan portrait" />
                <div className="panel-card">
                  <span className="status-dot" />
                  Available for work
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="content-section">
          <div className="container about-grid">
            <div className="section-heading left">
              <p className="eyebrow">About</p>
              <h2>Designing thoughtful experiences with practical execution.</h2>
            </div>

            <div className="about-copy">
              <p>
                I work at the intersection of technology and user experience, building products that are
                both visually polished and technically reliable. My approach is grounded in clarity,
                accessibility, and long-term scalability.
              </p>
              <p>
                From brand-first landing pages to responsive web applications, I turn complex ideas into
                intuitive digital products that feel premium and perform well.
              </p>
            </div>
          </div>
        </section>

        <section id="skills" className="content-section alt-section">
          <div className="container">
            <div className="section-heading center">
              <p className="eyebrow">Capabilities</p>
              <h2>What I bring to the table.</h2>
            </div>

            <div className="skills-grid">
              {skills.map((skillGroup) => (
                <article key={skillGroup.title} className="skill-card">
                  <h3>{skillGroup.title}</h3>
                  <ul>
                    {skillGroup.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="content-section">
          <div className="container">
            <div className="portfolio-toolbar">
              <div className="section-heading left compact-heading">
                <p className="eyebrow">Selected Work</p>
                <h2>Portfolio highlights.</h2>
              </div>

              <button type="button" className="button secondary small-button" onClick={openManager}>
                Manage highlights
              </button>
            </div>

            {isManagerOpen && (
              <div className="highlight-manager">
                <div className="manager-header">
                  <h3>{editingId === null ? 'Create a new highlight' : 'Edit highlight'}</h3>
                  <button type="button" className="ghost-button" onClick={closeManager}>
                    Close
                  </button>
                </div>

                <div className="manager-layout">
                  <div className="manager-list">
                    {portfolioItems.map((project) => (
                      <div key={project.id} className="manager-item">
                        <div>
                          <strong>{project.title}</strong>
                          <span>{project.category}</span>
                        </div>

                        <div className="manager-actions">
                          <button type="button" className="mini-button" onClick={() => startEdit(project)}>
                            Edit
                          </button>
                          <button type="button" className="mini-button danger" onClick={() => handleDelete(project.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form className="project-form" onSubmit={handleSubmit}>
                    <label>
                      Title
                      <input
                        type="text"
                        value={formState.title}
                        onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Project title"
                      />
                    </label>

                    <label>
                      Category
                      <input
                        type="text"
                        value={formState.category}
                        onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
                        placeholder="Brand, product, app, etc."
                      />
                    </label>

                    <label>
                      Image URLs
                      <input
                        type="text"
                        value={formState.images}
                        onChange={(event) => setFormState((current) => ({ ...current, images: event.target.value }))}
                        placeholder="/DogGo_2.jpg, /DogGo_3.png, /DogGo_4.jpg"
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        value={formState.description}
                        onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Tell us about the project"
                      />
                    </label>

                    <label>
                      Stack
                      <input
                        type="text"
                        value={formState.stack}
                        onChange={(event) => setFormState((current) => ({ ...current, stack: event.target.value }))}
                        placeholder="React, UX Design, Strategy"
                      />
                    </label>

                    <div className="form-actions">
                      <button type="submit" className="button primary">
                        {editingId === null ? 'Create highlight' : 'Save changes'}
                      </button>
                      <button type="button" className="button secondary" onClick={startCreate}>
                        New item
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="projects-grid">
              {portfolioItems.map((project) => {
                const currentImageIndex = activeImageIndex[project.id] ?? 0;
                const activeImage = project.images[currentImageIndex] ?? project.images[0];

                return (
                  <article key={project.id} className="project-card">
                    <div className="project-gallery">
                      <div className="project-image-wrap">
                        <button type="button" className="project-image-button" onClick={() => openFullscreenProject(project.id)}>
                          <img src={activeImage} alt={`${project.title} preview ${currentImageIndex + 1}`} />
                        </button>

                        {project.images.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="gallery-arrow gallery-arrow-left"
                              aria-label={`Previous image for ${project.title}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateActiveImage(project.id, -1);
                              }}
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              className="gallery-arrow gallery-arrow-right"
                              aria-label={`Next image for ${project.title}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                updateActiveImage(project.id, 1);
                              }}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      {project.images.length > 1 && (
                        <div className="project-thumb-row">
                          {project.images.map((image, index) => (
                            <button
                              key={`${project.id}-${index}`}
                              type="button"
                              className={`project-thumb-button ${index === currentImageIndex ? 'active' : ''}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setProjectImage(project.id, index);
                              }}
                              aria-label={`View image ${index + 1} for ${project.title}`}
                            >
                              <img src={image} alt={`${project.title} preview ${index + 1}`} className="project-thumb" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="project-body">
                      <span className="project-category">{project.category}</span>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="tag-row">
                        {project.stack.map((tag) => (
                          <span key={`${project.id}-${tag}`} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {fullscreenProjectId !== null && (() => {
              const project = portfolioItems.find((item) => item.id === fullscreenProjectId);
              if (!project) return null;

              const modalIndex = activeImageIndex[project.id] ?? 0;
              const modalImage = project.images[modalIndex] ?? project.images[0];

              return (
                <div className="fullscreen-overlay" onClick={closeFullscreenProject}>
                  <div className="fullscreen-modal" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="fullscreen-close" onClick={closeFullscreenProject} aria-label="Close full view">
                      ×
                    </button>

                    <div className="fullscreen-image-shell">
                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-left fullscreen-arrow"
                        aria-label={`Previous image for ${project.title}`}
                        onClick={() => updateActiveImage(project.id, -1)}
                      >
                        ‹
                      </button>

                      <img src={modalImage} alt={`${project.title} full view ${modalIndex + 1}`} className="fullscreen-image" />

                      <button
                        type="button"
                        className="gallery-arrow gallery-arrow-right fullscreen-arrow"
                        aria-label={`Next image for ${project.title}`}
                        onClick={() => updateActiveImage(project.id, 1)}
                      >
                        ›
                      </button>
                    </div>

                    <div className="fullscreen-meta">
                      <div>
                        <span className="project-category">{project.category}</span>
                        <h3>{project.title}</h3>
                      </div>
                      <div className="fullscreen-thumbs">
                        {project.images.map((image, index) => (
                          <button
                            key={`${project.id}-full-${index}`}
                            type="button"
                            className={`project-thumb-button ${index === modalIndex ? 'active' : ''}`}
                            onClick={() => setProjectImage(project.id, index)}
                            aria-label={`View image ${index + 1} for ${project.title}`}
                          >
                            <img src={image} alt={`${project.title} preview ${index + 1}`} className="project-thumb" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <section id="contact" className="content-section cta-section">
          <div className="container contact-shell">
            <div>
              <p className="eyebrow">Contact</p>
              <h2>Let’s build something meaningful.</h2>
            </div>

            <div className="contact-details">
              <a href="mailto:alex.morgan@example.com">alex.morgan@example.com</a>
              <a href="tel:+15551234567">+1 (555) 123-4567</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-shell">
          <span>© {new Date().getFullYear()} Alex Morgan</span>
          <span>Built as a portfolio website</span>
        </div>
      </footer>
    </div>
  );
}

export default App;