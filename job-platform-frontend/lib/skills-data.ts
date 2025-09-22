// Comprehensive predefined skills organized by job categories
export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'software-tech',
    name: 'Software & Technology',
    skills: [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
      'HTML', 'CSS', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
      'Machine Learning', 'Artificial Intelligence', 'Data Science', 'DevOps', 'CI/CD',
      'Mobile Development', 'iOS Development', 'Android Development', 'React Native', 'Flutter',
      'Web Development', 'Full Stack Development', 'Frontend Development', 'Backend Development',
      'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    skills: [
      'Patient Care', 'Medical Diagnosis', 'Surgery', 'Emergency Medicine', 'Pediatrics',
      'Cardiology', 'Neurology', 'Oncology', 'Dermatology', 'Orthopedics',
      'Nursing', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy',
      'Medical Records', 'HIPAA Compliance', 'Medical Coding', 'Pharmacy',
      'Laboratory Technician', 'Radiology', 'Ultrasound', 'MRI', 'CT Scan',
      'Medical Equipment', 'Vital Signs', 'Medication Administration', 'Wound Care'
    ]
  },
  {
    id: 'education',
    name: 'Education & Teaching',
    skills: [
      'Curriculum Development', 'Lesson Planning', 'Classroom Management', 'Student Assessment',
      'Educational Technology', 'Online Teaching', 'Special Education', 'ESL Teaching',
      'Mathematics', 'Science', 'English Literature', 'History', 'Geography',
      'Art Education', 'Music Education', 'Physical Education', 'Foreign Languages',
      'Early Childhood Education', 'Elementary Education', 'Secondary Education',
      'Adult Education', 'Vocational Training', 'Educational Psychology', 'Learning Disabilities',
      'Educational Administration', 'School Counseling', 'Academic Advising'
    ]
  },
  {
    id: 'culinary',
    name: 'Culinary & Food Service',
    skills: [
      'Cooking', 'Baking', 'Pastry Making', 'Menu Planning', 'Food Preparation',
      'Kitchen Management', 'Food Safety', 'HACCP', 'Culinary Arts', 'Fine Dining',
      'International Cuisine', 'Italian Cuisine', 'French Cuisine', 'Asian Cuisine',
      'Grilling', 'Sautéing', 'Knife Skills', 'Food Presentation', 'Wine Pairing',
      'Catering', 'Restaurant Management', 'Inventory Management', 'Cost Control',
      'Nutrition', 'Dietary Planning', 'Food Service', 'Bar Management', 'Bartending'
    ]
  },
  {
    id: 'construction',
    name: 'Construction & Trades',
    skills: [
      'Plumbing', 'Electrical Work', 'HVAC', 'Carpentry', 'Masonry', 'Roofing',
      'Flooring', 'Painting', 'Drywall', 'Welding', 'Concrete Work', 'Excavation',
      'Blueprint Reading', 'Project Management', 'Safety Compliance', 'OSHA',
      'Equipment Operation', 'Heavy Machinery', 'Construction Management',
      'Building Codes', 'Permits', 'Quality Control', 'Cost Estimation',
      'Renovation', 'Remodeling', 'Maintenance', 'Repair Work'
    ]
  },
  {
    id: 'business',
    name: 'Business & Management',
    skills: [
      'Project Management', 'Team Leadership', 'Strategic Planning', 'Budget Management',
      'Financial Analysis', 'Marketing', 'Sales', 'Customer Service', 'Business Development',
      'Operations Management', 'Supply Chain Management', 'Human Resources', 'Recruiting',
      'Training & Development', 'Performance Management', 'Process Improvement',
      'Data Analysis', 'Business Intelligence', 'Risk Management', 'Compliance',
      'Negotiation', 'Presentation Skills', 'Public Speaking', 'Communication',
      'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Outlook'
    ]
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    skills: [
      'Graphic Design', 'Web Design', 'UI/UX Design', 'Brand Design', 'Logo Design',
      'Print Design', 'Packaging Design', 'Motion Graphics', 'Video Editing',
      'Photography', 'Videography', 'Content Creation', 'Social Media Design',
      'Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
      'Premiere Pro', 'Figma', 'Sketch', 'Canva', 'Typography', 'Color Theory',
      'Art Direction', 'Creative Writing', 'Copywriting', 'Content Strategy'
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    skills: [
      'Accounting', 'Bookkeeping', 'Financial Analysis', 'Tax Preparation', 'Auditing',
      'Payroll', 'Accounts Payable', 'Accounts Receivable', 'Financial Reporting',
      'Budgeting', 'Forecasting', 'Investment Analysis', 'Risk Assessment',
      'QuickBooks', 'SAP', 'Oracle', 'Excel', 'Financial Modeling', 'Variance Analysis',
      'Cost Accounting', 'Managerial Accounting', 'GAAP', 'IFRS', 'Compliance',
      'Banking', 'Insurance', 'Real Estate Finance', 'Corporate Finance'
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Communications',
    skills: [
      'Digital Marketing', 'Social Media Marketing', 'Content Marketing', 'Email Marketing',
      'SEO', 'SEM', 'PPC', 'Google Analytics', 'Facebook Ads', 'Google Ads',
      'Marketing Strategy', 'Brand Management', 'Public Relations', 'Event Planning',
      'Market Research', 'Customer Analysis', 'Campaign Management', 'Lead Generation',
      'Marketing Automation', 'HubSpot', 'Mailchimp', 'Hootsuite', 'Buffer',
      'Copywriting', 'Content Creation', 'Video Marketing', 'Influencer Marketing'
    ]
  },
  {
    id: 'customer-service',
    name: 'Customer Service & Support',
    skills: [
      'Customer Support', 'Technical Support', 'Help Desk', 'Call Center', 'Live Chat',
      'Email Support', 'Phone Support', 'Problem Solving', 'Conflict Resolution',
      'Product Knowledge', 'Order Processing', 'Returns & Exchanges', 'Complaint Handling',
      'Customer Satisfaction', 'Service Level Agreements', 'Ticketing Systems',
      'CRM Systems', 'Salesforce', 'Zendesk', 'Freshdesk', 'Interpersonal Skills',
      'Active Listening', 'Empathy', 'Patience', 'Communication Skills'
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    skills: [
      'Supply Chain Management', 'Inventory Management', 'Warehouse Operations',
      'Shipping & Receiving', 'Forklift Operation', 'Order Fulfillment',
      'Logistics Planning', 'Route Optimization', 'Freight Management',
      'Import/Export', 'Customs Clearance', 'Transportation Management',
      'Delivery Services', 'Fleet Management', 'Safety Compliance',
      'Quality Control', 'Vendor Management', 'Procurement', 'Cost Optimization'
    ]
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Tourism',
    skills: [
      'Hotel Management', 'Front Desk Operations', 'Guest Services', 'Housekeeping',
      'Event Planning', 'Catering', 'Tourism', 'Travel Planning', 'Customer Service',
      'Reservation Systems', 'Revenue Management', 'Hospitality Operations',
      'Food & Beverage', 'Concierge Services', 'Spa Services', 'Entertainment',
      'Multilingual', 'Cultural Awareness', 'Problem Solving', 'Time Management'
    ]
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    skills: [
      'Legal Research', 'Contract Law', 'Corporate Law', 'Litigation', 'Legal Writing',
      'Paralegal', 'Legal Assistant', 'Compliance', 'Regulatory Affairs',
      'Intellectual Property', 'Employment Law', 'Real Estate Law', 'Family Law',
      'Criminal Law', 'Immigration Law', 'Tax Law', 'Document Review',
      'Case Management', 'Court Filing', 'Legal Documentation', 'Client Relations'
    ]
  },
  {
    id: 'sales',
    name: 'Sales & Retail',
    skills: [
      'Sales', 'Account Management', 'Lead Generation', 'Prospecting', 'Cold Calling',
      'Negotiation', 'Closing Deals', 'Customer Relationship Management', 'CRM',
      'Retail Sales', 'Merchandising', 'Inventory Management', 'Visual Merchandising',
      'Product Knowledge', 'Sales Training', 'Sales Analytics', 'Territory Management',
      'B2B Sales', 'B2C Sales', 'Inside Sales', 'Outside Sales', 'E-commerce Sales'
    ]
  },
  {
    id: 'other',
    name: 'Other Skills',
    skills: [
      'Time Management', 'Organization', 'Problem Solving', 'Critical Thinking',
      'Communication', 'Teamwork', 'Leadership', 'Adaptability', 'Creativity',
      'Attention to Detail', 'Multitasking', 'Stress Management', 'Conflict Resolution',
      'Project Coordination', 'Data Entry', 'Administrative Support', 'Office Management',
      'Event Coordination', 'Volunteer Management', 'Community Outreach', 'Public Speaking'
    ]
  }
];

// Get all skills as a flat array
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap(category => category.skills);

// Get skills by category
export const getSkillsByCategory = (categoryId: string): string[] => {
  const category = SKILL_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.skills : [];
};

// Search skills
export const searchSkills = (query: string): string[] => {
  const lowercaseQuery = query.toLowerCase();
  return ALL_SKILLS.filter(skill => 
    skill.toLowerCase().includes(lowercaseQuery)
  );
};

// Get categories for a specific skill
export const getCategoriesForSkill = (skill: string): string[] => {
  return SKILL_CATEGORIES
    .filter(category => category.skills.includes(skill))
    .map(category => category.name);
};
