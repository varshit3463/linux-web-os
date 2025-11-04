<script>
  import '../styles/AboutMe.css';
  
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const projects = [
    {
      title: "Shopwise AI – Customer Support Chatbot",
      tech: "Python, Pandas, Falcon-7B, OpenRouter API",
      description: "Built an intelligent Telegram chatbot that retrieves product details from CSV data and responds naturally in chat. Reduced scripted logic by ~60% with AI-based language understanding.",
      date: "Jan 2025"
    },
    {
      title: "3D Product Showcase Website",
      tech: "Three.js, GSAP, Blender",
      description: "Created a cinematic product showcase site for a custom phone brand. Features scroll-triggered animations, zoom transitions, and realistic 3D visuals for a premium commercial look.",
      date: "Mar 2025"
    },
    {
      title: "Royalté Resto – Restaurant Website",
      tech: "HTML, CSS, JavaScript",
      description: "Designed a visually rich, responsive restaurant website with animated banners, chef profiles, and a reservation form simulating a real ordering experience.",
      date: "Oct 2023"
    },
    {
      title: "Justice Jukebox",
      tech: "Twilio, Dialogflow, Python",
      description: "Developed a multilingual WhatsApp-based legal literacy chatbot that provides accessible legal information and guidance to users."
    }
  ];

  const skills = {
    languages: ["Python", "Java", "C", "HTML", "CSS"],
    frameworks: ["Three.js", "GSAP"],
    databases: ["MySQL", "MongoDB"],
    tools: ["Blender", "Unreal Engine", "Telegram Bot API", "Dialogflow", "OpenRouter API", "Twilio"],
    concepts: ["AI Chatbot Development", "3D Design & Animation", "Web3 & Decentralized Identity", "Game Tech"]
  };

  const education = [
    {
      degree: "Bachelor of Technology (B.Tech)",
      field: "Information Science and Engineering",
      institution: "Reva University, Bengaluru",
      duration: "2022 - Present | CGPA: 9.38"
    },
    {
      degree: "Pre-University",
      field: "Science Stream",
      institution: "Vidyavahini PU College, Tumakuru",
      duration: "2020 - 2022 | Percentage: 91.83%"
    },
    {
      degree: "Secondary School (10th)",
      institution: "Oxford School, Tumkur, Karnataka",
      duration: "2020 | Percentage: 89.86%"
    }
  ];

  const certifications = [
    { name: "MongoDB", issuer: "MongoDB University", bgImage: "/references/icons/aboutme/certificates/Mongodb.png" },
    { name: "Generative AI", issuer: "Google Cloud", bgImage: "/references/icons/aboutme/certificates/GenerativeAi.png" },
    { name: "Leverage AI Tools", issuer: "Google", bgImage: "/references/icons/aboutme/certificates/LeverageAitools.png" },
    { name: "PyMongo Case Study", issuer: "MongoDB", bgImage: "/references/icons/aboutme/certificates/Pymongo.png" }
  ];

  const interests = [
    { icon: "/references/icons/3d_design.svg", name: "3D Design", desc: "Blender, fluid & ocean simulations" },
    { icon: "/references/icons/ai_chatbot.svg", name: "AI Chatbots", desc: "Intelligent conversation systems" },
    { icon: "/references/icons/creative_web.svg", name: "Creative Web", desc: "Cinematic UI & animations" },
    { icon: "/references/icons/gametech.svg", name: "Game Tech", desc: "Unreal Engine projects" },
    { icon: "/references/icons/web3.svg", name: "Web3", desc: "Decentralized identity" },
    { icon: "/references/icons/innovation.svg", name: "Innovation", desc: "Experimental tech ideas" }
  ];

  const navCards = [
    { section: 'projects', icon: '/references/icons/aboutme/projects_icon.png', label: 'Projects', class: 'div1' },
    { section: 'education', icon: '/references/icons/aboutme/education_icon.png', label: 'Education', class: 'div2 featured' },
    { section: 'skills', icon: '/references/icons/aboutme/techincal_skills_icon.png', label: 'Technical Skills', class: 'div3' },
    { section: 'interests', icon: '/references/icons/aboutme/intrests_tcon.png', label: 'Interests', class: 'div4' },
    { section: 'achievements', icon: '/references/icons/aboutme/achivements_icon.png', label: 'Certifications', class: 'div5' },
    { section: 'contact', icon: '/references/icons/aboutme/contact_icon.png', label: 'Contact Me', class: 'div6' }
  ];

  const contacts = [
    { type: 'email', href: 'mailto:hvarshith5@gmail.com', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', title: 'Email', text: 'hvarshith5@gmail.com' },
    { type: 'phone', href: 'tel:+918197693513', icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', title: 'Phone', text: '+91 8197693513' },
    { type: 'github', href: 'https://github.com/varshit3463', icon: 'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z', title: 'GitHub', text: 'github.com/varshit3463' },
    { type: 'linkedin', href: 'https://linkedin.com/in/varshith-h-0302bb2b7', icon: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z', title: 'LinkedIn', text: 'linkedin.com/in/varshith-h-0302bb2b7' }
  ];
</script>

<div class="aboutme-scroll-container" on:contextmenu|stopPropagation|preventDefault>
  <!-- Navigation Grid -->
  <section id="home" class="section-home">
    <div class="bio-header">
      <div class="bio-content">
        <h1 class="name-title">Varshith H</h1>
        <p class="tagline">Full Stack Developer & Creative Tech Enthusiast</p>
        <p class="bio-description">
          I'm a passionate developer who loves combining creativity with technology to build meaningful digital experiences. 
          My work ranges from AI chatbots and web interfaces to immersive 3D integrations using modern frameworks and open-source tools. 
          I'm always experimenting with innovative ideas to make technology more engaging, efficient, and accessible.
        </p>
      </div>
      <div class="avatar-3d">
        <img src="/references/icons/aboutme/me.png" alt="Profile" />
      </div>
    </div>

    <div class="nav-grid">
      {#each navCards as card}
        <button class="nav-card {card.class}" on:click={() => scrollToSection(card.section)}>
          <img src={card.icon} alt={card.label} />
          <span>{card.label}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/projects_icon.png" alt="" class="section-icon" />
      <h2>Featured Projects</h2>
    </div>
    <div class="projects-grid">
      {#each projects as project}
        <div class="project-card">
          <h3>{project.title}</h3>
          <div class="tech-stack">{project.tech}</div>
          {#if project.date}
            <div class="project-date">{project.date}</div>
          {/if}
          <p>{project.description}</p>
          <div class="card-accent"></div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Education Section -->
  <section id="education" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/education_icon.png" alt="" class="section-icon" />
      <h2>Education</h2>
    </div>
    <div class="education-timeline">
      {#each education as edu}
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h3>{edu.degree}</h3>
            {#if edu.field}
              <h4>{edu.field}</h4>
            {/if}
            <p class="institution">{edu.institution}</p>
            <p class="duration">{edu.duration}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Skills Section -->
  <section id="skills" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/techincal_skills_icon.png" alt="" class="section-icon" />
      <h2>Technical Skills</h2>
    </div>
    <div class="skills-container">
      <div class="skill-category">
        <h3>Languages</h3>
        <div class="skill-tags">
          {#each skills.languages as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      </div>
      <div class="skill-category">
        <h3>Frameworks & Libraries</h3>
        <div class="skill-tags">
          {#each skills.frameworks as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      </div>
      <div class="skill-category">
        <h3>Databases</h3>
        <div class="skill-tags">
          {#each skills.databases as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      </div>
      <div class="skill-category">
        <h3>Tools & Platforms</h3>
        <div class="skill-tags">
          {#each skills.tools as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      </div>
      <div class="skill-category">
        <h3>Core Concepts</h3>
        <div class="skill-tags">
          {#each skills.concepts as skill}
            <span class="skill-tag">{skill}</span>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Interests Section -->
  <section id="interests" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/intrests_tcon.png" alt="" class="section-icon" />
      <h2>Interests & Hobbies</h2>
    </div>
    <div class="interests-grid">
      {#each interests as interest}
        <div class="interest-card">
          <div class="interest-icon">
            <img src={interest.icon} alt={interest.name} />
          </div>
          <h4>{interest.name}</h4>
          <p>{interest.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Certifications Section -->
  <section id="achievements" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/achivements_icon.png" alt="" class="section-icon" />
      <h2>Certifications & Achievements</h2>
    </div>
    <div class="certifications-grid">
      {#each certifications as cert}
        <div class="cert-card" style="background-image: url('{cert.bgImage}');">
          <div class="cert-overlay"></div>
          <div class="cert-content">
            <div class="cert-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h4>{cert.name}</h4>
            <p>{cert.issuer}</p>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="section-full">
    <div class="section-header">
      <img src="/references/icons/aboutme/contact_icon.png" alt="" class="section-icon" />
      <h2>Get In Touch</h2>
    </div>
    <div class="contact-container">
      <div class="contact-grid">
        {#each contacts as contact}
          <a href={contact.href} class="contact-card" target={contact.type === 'github' || contact.type === 'linkedin' ? '_blank' : undefined} rel={contact.type === 'github' || contact.type === 'linkedin' ? 'noopener noreferrer' : undefined}>
            <div class="contact-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d={contact.icon}/>
              </svg>
            </div>
            <h4>{contact.title}</h4>
            <p>{contact.text}</p>
          </a>
        {/each}
      </div>
      <div class="location-info">
        <div class="location-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <p>Bengaluru, Karnataka, India</p>
      </div>
    </div>
  </section>
</div>


