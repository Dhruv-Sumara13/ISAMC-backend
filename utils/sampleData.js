import { executiveCouncilMembers } from './executiveCouncil.js';
// Sample data for all admin sections
export const sampleData = {
  executiveCouncil: executiveCouncilMembers,
  // Membership Tiers
  tier: [
    {
      type: "Student Membership",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      price: {
        annualPrice: "500"
      },
      time_period: {
        annual: "1 Year"
      },
      description: "Perfect for students and early career professionals",
      benefits: [
        "Access to all webinars",
        "Networking opportunities",
        "Resource library access"
      ]
    },
    {
      type: "Professional Membership",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      price: {
        annualPrice: "2000",
        lifePrice: "15000"
      },
      time_period: {
        annual: "1 Year",
        lifetime: "Lifetime"
      },
      description: "For working professionals in the industry",
      benefits: [
        "All student benefits",
        "Industry reports",
        "Certification programs",
        "Priority event booking"
      ]
    },
    {
      type: "Corporate Membership",
      img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100",
      price: {
        annualPrice: "10000",
        lifePrice: "50000"
      },
      time_period: {
        annual: "1 Year",
        lifetime: "Lifetime"
      },
      description: "For organizations and companies",
      benefits: [
        "All professional benefits",
        "Multiple user accounts",
        "Custom training programs",
        "Dedicated support"
      ]
    },
    {
      type: "Honorary Membership",
      img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      price: "By Invitation Only",
      time_period: "Lifetime",
      description: "Special membership for distinguished individuals",
      benefits: [
        "All benefits included",
        "VIP access",
        "Special recognition",
        "Exclusive events"
      ]
    }
  ],

  // Latest News
  News: [
    {
      title: "New Research Initiative Launched",
      body: "We are excited to announce our latest research initiative focusing on sustainable manufacturing practices.",
      date: "2024-12-15",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
      referenceUrl: "https://example.com/news/research-initiative"
    },
    {
      title: "Annual Conference 2024 Announced",
      body: "Save the date for our annual conference featuring industry leaders and cutting-edge research presentations.",
      date: "2024-12-10",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
      referenceUrl: "https://example.com/news/conference-2024"
    }
  ],

  // Featured Events
  Events: [
    {
      title: "Advanced Manufacturing Workshop",
      body: "Join us for an intensive workshop on advanced manufacturing techniques and Industry 4.0 technologies.",
      date: "2024-12-20",
      location: "Mumbai, India",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500",
      overview: "This workshop covers the latest trends in manufacturing technology.",
      highlights: "Hands-on sessions, Expert speakers, Networking opportunities",
      theme: "Industry 4.0 and Smart Manufacturing",
      speakers: ["Dr. John Smith", "Prof. Sarah Johnson", "Mr. Raj Patel"],
      agenda: "Day 1: Introduction to Industry 4.0\nDay 2: Hands-on sessions\nDay 3: Case studies",
      referenceLinks: "https://example.com/workshop-details"
    }
  ],

  // Upcoming Events
  upevents: [
    {
      title: "Future of Manufacturing Symposium",
      body: "Explore the future trends and technologies that will shape the manufacturing industry.",
      date: "2025-01-15",
      location: "Delhi, India",
      imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500",
      overview: "A comprehensive look at emerging manufacturing technologies.",
      highlights: "Keynote speakers, Panel discussions, Technology demos",
      theme: "Sustainable and Smart Manufacturing",
      referenceLinks: "https://example.com/symposium"
    }
  ],

  // Past Events
  pastEvents: [
    {
      title: "Manufacturing Excellence Summit 2023",
      body: "A successful summit that brought together industry leaders to discuss manufacturing excellence.",
      date: "2023-11-20",
      location: "Bangalore, India",
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500",
      overview: "The summit focused on operational excellence and lean manufacturing.",
      highlights: "200+ attendees, 15 speakers, 3 days of intensive sessions",
      theme: "Operational Excellence in Manufacturing",
      referenceLinks: "https://example.com/summit-2023"
    }
  ],

  // Other AM Events
  otherEvents: [
    {
      title: "Regional Manufacturing Meet",
      body: "Local manufacturing companies gathering to discuss regional challenges and opportunities.",
      date: "2024-12-25",
      location: "Chennai, India",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500"
    }
  ],

  // Publications
  Publications: [
    {
      title: "Advanced Manufacturing Techniques",
      subtitle: "A Comprehensive Guide",
      body: "This publication covers the latest techniques in advanced manufacturing, including additive manufacturing, automation, and quality control.",
      imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
      author: "Dr. Manufacturing Expert"
    },
    {
      title: "Industry 4.0 Implementation",
      subtitle: "Best Practices and Case Studies", 
      body: "Learn how to successfully implement Industry 4.0 technologies in your manufacturing operations.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      author: "Prof. Tech Innovation"
    }
  ],

  // Video Resources
  videos: [
    {
      title: "Introduction to Smart Manufacturing",
      description: "Learn the basics of smart manufacturing and how it's transforming the industry.",
      youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      author: "Manufacturing Academy",
      tags: ["smart manufacturing", "industry 4.0", "automation"],
      isFeatured: true,
      order: 1,
      isActive: true,
      category: "Manufacturing",
      duration: "10:30",
      publishDate: "2024-01-15"
    },
    {
      title: "Lean Manufacturing Principles",
      description: "Understanding the core principles of lean manufacturing and their practical applications.",
      youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
      author: "Lean Expert",
      tags: ["lean manufacturing", "efficiency", "waste reduction"],
      isFeatured: false,
      order: 2,
      isActive: true,
      category: "Process Improvement",
      duration: "8:45",
      publishDate: "2024-01-10"
    },
    {
      title: "3D Printing Technology Overview",
      description: "Comprehensive overview of 3D printing technologies and their applications in manufacturing.",
      youtubeUrl: "https://www.youtube.com/watch?v=Vx0Z6LplaMU",
      author: "3D Print Expert",
      tags: ["3d printing", "additive manufacturing", "technology"],
      isFeatured: true,
      order: 3,
      isActive: true,
      category: "Technology",
      duration: "12:15",
      publishDate: "2024-01-05"
    },
    {
      title: "Quality Control in Manufacturing",
      description: "Best practices for implementing quality control systems in manufacturing processes.",
      youtubeUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
      author: "Quality Expert",
      tags: ["quality control", "manufacturing", "best practices"],
      isFeatured: false,
      order: 4,
      isActive: true,
      category: "Quality",
      duration: "15:20",
      publishDate: "2024-01-01"
    }
  ],

  // Partners
  partners: [
    {
      title: "TechCorp Industries",
      imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200"
    },
    {
      title: "Manufacturing Solutions Ltd",
      imageUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200"
    }
  ],

  // Leadership
  leadership: [
    {
      fullName: "Dr. Rajesh Kumar",
      post: "President",
      place: "Mumbai",
      expertise: "Advanced Manufacturing, Industry 4.0",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      email: "rajesh.kumar@example.com",
      linkedinUrl: "https://linkedin.com/in/rajeshkumar",
      websiteUrl: "https://rajeshkumar.com"
    },
    {
      fullName: "Prof. Priya Sharma",
      post: "Vice President",
      place: "Delhi",
      expertise: "Sustainable Manufacturing, Quality Control",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300",
      email: "priya.sharma@example.com",
      linkedinUrl: "https://linkedin.com/in/priyasharma"
    }
  ],

  // Testimonials
  Testimonials: [
    {
      title: "Excellent Learning Experience",
      body: "The workshops and resources provided by this organization have significantly improved our manufacturing processes. Highly recommended!",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      author: "John Smith, Manufacturing Manager"
    },
    {
      title: "Great Networking Opportunities",
      body: "Being a member has opened up numerous networking opportunities and helped us connect with industry leaders.",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      author: "Sarah Johnson, Operations Director"
    }
  ],

  // Mission
  Mission: [
    {
      title: "Our Mission",
      body: "To advance the manufacturing industry through education, research, and collaboration, fostering innovation and excellence in manufacturing practices.",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500"
    }
  ],

  // Member Benefits
  Member: [
    {
      title: "Exclusive Access",
      body: "Get exclusive access to industry reports, research papers, and cutting-edge manufacturing insights.",
      imageUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500"
    },
    {
      title: "Networking Events",
      body: "Connect with industry professionals, researchers, and thought leaders at our regular networking events.",
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500"
    },
    {
      title: "Professional Development",
      body: "Enhance your skills with our professional development programs, workshops, and certification courses.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500"
    }
  ],

  // Features
  features: [
    {
      title: "Advanced Learning Platform",
      body: "Access our state-of-the-art learning management system with interactive courses and assessments.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"
    },
    {
      title: "Industry Connections",
      body: "Connect with leading manufacturers, suppliers, and technology providers in our extensive network.",
      imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500"
    }
  ],

  // Blogs
  blogs: [
    {
      id: "blog-1",
      title: "The Future of Manufacturing: Trends to Watch in 2024",
      summary: "Explore the key trends shaping the manufacturing industry in 2024, from AI integration to sustainable practices.",
      content: "The manufacturing industry is undergoing rapid transformation driven by technological advances and changing market demands. In 2024, we're seeing several key trends that are reshaping how manufacturers operate...",
      author: "Dr. Manufacturing Expert",
      date: "2024-12-01",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500"
    },
    {
      id: "blog-2", 
      title: "Implementing Lean Manufacturing: A Step-by-Step Guide",
      summary: "Learn how to successfully implement lean manufacturing principles in your organization with this comprehensive guide.",
      content: "Lean manufacturing has proven to be one of the most effective approaches to improving operational efficiency and reducing waste. This guide provides a practical roadmap for implementation...",
      author: "Lean Manufacturing Specialist",
      date: "2024-11-28",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500"
    }
  ],

  // Gallery
  gallery: [
    {
      title: "Manufacturing Excellence Awards 2023",
      images: [
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500"
      ]
    },
    {
      title: "Workshop Highlights",
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"
      ]
    }
  ],

  // Video Resources
  videoResources: [
    {
      id: 1,
      title: "Smart Manufacturing Implementation Guide",
      description: "Comprehensive PDF guide covering the implementation of smart manufacturing technologies in traditional manufacturing environments.",
      resourceUrl: "https://example.com/resources/smart-manufacturing-guide.pdf",
      resourceType: "documentation",
      videoId: "smart-manufacturing-intro",
      isActive: true,
      category: "Implementation",
      fileSize: "3.2 MB",
      downloadable: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Lean Manufacturing Presentation Slides",
      description: "PowerPoint presentation slides covering lean manufacturing principles, tools, and implementation strategies.",
      resourceUrl: "https://example.com/resources/lean-manufacturing-slides.pptx",
      resourceType: "slides",
      videoId: "lean-manufacturing-principles",
      isActive: true,
      category: "Training",
      fileSize: "8.5 MB",
      downloadable: true,
      createdAt: "2024-01-10T14:30:00Z",
      updatedAt: "2024-01-10T14:30:00Z"
    },
    {
      id: 3,
      title: "3D Printing Code Repository",
      description: "GitHub repository containing sample code, CAD files, and configuration examples for 3D printing applications.",
      resourceUrl: "https://github.com/example/3d-printing-resources",
      resourceType: "code",
      videoId: "3d-printing-overview",
      isActive: true,
      category: "Development",
      downloadable: false,
      createdAt: "2024-01-05T09:15:00Z",
      updatedAt: "2024-01-05T09:15:00Z"
    },
    {
      id: 4,
      title: "Quality Control Dataset",
      description: "Sample dataset for quality control analysis including defect detection examples and statistical process control data.",
      resourceUrl: "https://example.com/datasets/quality-control-data.csv",
      resourceType: "dataset",
      videoId: "quality-control-manufacturing",
      isActive: true,
      category: "Analytics",
      fileSize: "12.8 MB",
      downloadable: true,
      createdAt: "2024-01-01T16:45:00Z",
      updatedAt: "2024-01-01T16:45:00Z"
    },
    {
      id: 5,
      title: "Manufacturing Standards Reference",
      description: "Quick reference guide to international manufacturing standards including ISO 9001, ISO 14001, and industry-specific standards.",
      resourceUrl: "https://example.com/resources/manufacturing-standards-reference.pdf",
      resourceType: "reference",
      isActive: true,
      category: "Standards",
      fileSize: "2.1 MB",
      downloadable: true,
      createdAt: "2023-12-28T11:20:00Z",
      updatedAt: "2023-12-28T11:20:00Z"
    },
    {
      id: 6,
      title: "Process Improvement Tutorial",
      description: "Step-by-step tutorial for identifying and implementing process improvements in manufacturing operations.",
      resourceUrl: "https://example.com/tutorials/process-improvement-guide.html",
      resourceType: "tutorial",
      isActive: true,
      category: "Training",
      downloadable: false,
      createdAt: "2023-12-25T13:10:00Z",
      updatedAt: "2023-12-25T13:10:00Z"
    }
  ],

  // Equipment
  equipment: [
    {
      title: "Ultimaker S3 3D Printer",
      img: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500",
      body: "Professional dual-extrusion 3D printer designed for reliable, industrial-grade printing with advanced materials and complex geometries.",
      useCase: "Ideal for rapid prototyping, functional testing, small-batch production, and educational demonstrations in additive manufacturing research and development."
    },
    {
      title: "SEM Scanning Electron Microscope",
      img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500",
      body: "High-resolution scanning electron microscope for detailed surface analysis and characterization of materials at nanoscale level.",
      useCase: "Essential for material characterization, quality control, failure analysis, and research in nanotechnology and materials science applications."
    },
    {
      title: "Universal Testing Machine (UTM)",
      img: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
      body: "Precision mechanical testing equipment for determining tensile, compressive, and flexural properties of materials and components.",
      useCase: "Critical for material property evaluation, quality assurance testing, product development, and compliance with international testing standards."
    },
    {
      title: "X-Ray Diffractometer (XRD)",
      img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500",
      body: "Advanced analytical instrument for crystal structure analysis and phase identification in crystalline materials.",
      useCase: "Fundamental for crystallographic analysis, phase identification, texture analysis, and structural characterization in materials research."
    },
    {
      title: "CNC Machining Center",
      img: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500",
      body: "High-precision computer numerical control machining center for automated manufacturing of complex parts with tight tolerances.",
      useCase: "Perfect for precision manufacturing, prototyping, tooling production, and small to medium batch production of complex mechanical components."
    },
    {
      title: "Laser Cutting System",
      img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500",
      body: "Industrial fiber laser cutting system for precise cutting of various materials including metals, plastics, and composites.",
      useCase: "Excellent for sheet metal fabrication, rapid prototyping, custom part production, and precision cutting applications in manufacturing."
    }
  ],

  // Background Images
  backgrounds: [
    {
      id: 1,
      name: "Hero Section Background",
      description: "Main hero section background image with manufacturing theme",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920",
      section: "hero",
      isActive: true,
      order: 1,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      name: "About Section Background",
      description: "Background image for about us section",
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920",
      section: "about",
      isActive: true,
      order: 1,
      createdAt: "2024-01-14T14:30:00Z",
      updatedAt: "2024-01-14T14:30:00Z"
    },
    {
      id: 3,
      name: "Events Section Background",
      description: "Background for events and conferences section",
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920",
      section: "events",
      isActive: true,
      order: 1,
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T09:15:00Z"
    },
    {
      id: 4,
      name: "Membership Background",
      description: "Background image for membership section",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920",
      section: "membership",
      isActive: true,
      order: 1,
      createdAt: "2024-01-12T16:45:00Z",
      updatedAt: "2024-01-12T16:45:00Z"
    },
    {
      id: 5,
      name: "Contact Section Background",
      description: "Background for contact us section",
      imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920",
      section: "contact",
      isActive: true,
      order: 1,
      createdAt: "2024-01-11T11:20:00Z",
      updatedAt: "2024-01-11T11:20:00Z"
    },
    {
      id: 6,
      name: "Login Page Background",
      description: "Background image for login and authentication pages",
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1920",
      section: "login",
      isActive: true,
      order: 1,
      createdAt: "2024-01-10T13:10:00Z",
      updatedAt: "2024-01-10T13:10:00Z"
    }
  ]
};

// Function to initialize database with sample data
export const initializeSampleData = async (DB) => {
  try {
    // Check if data already exists
    const existingData = await DB.findOne({});
    
    if (!existingData) {
      // Create new document with sample data
      const newData = new DB(sampleData);
      await newData.save();
      console.log('Sample data initialized successfully');
      return { success: true, message: 'Sample data initialized' };
    } else {
      // Update existing document with missing sections
      const updateData = {};
      let hasUpdates = false;
      
      Object.keys(sampleData).forEach(section => {
        if (section === 'executiveCouncil' && existingData[section] !== undefined) return;
        if (!existingData[section] || (Array.isArray(existingData[section]) && existingData[section].length === 0)) {
          updateData[section] = sampleData[section];
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        await DB.findOneAndUpdate({}, updateData, { new: true });
        console.log('Missing sections added to existing data');
        return { success: true, message: 'Missing sections added', sections: Object.keys(updateData) };
      } else {
        console.log('All sections already have data');
        return { success: true, message: 'All sections already populated' };
      }
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return { success: false, error: error.message };
  }
};
