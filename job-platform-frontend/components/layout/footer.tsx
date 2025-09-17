import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, Mail, Twitter, Linkedin, Instagram, Facebook } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "For Job Seekers",
      links: [
        { name: "Browse Jobs", href: "/jobs" },
        { name: "Career Advice", href: "/career-advice" },
        { name: "Company Reviews", href: "/companies" },
        { name: "Salary Guide", href: "/salary-guide" },
        { name: "Resume Builder", href: "/resume-builder" },
      ]
    },
    {
      title: "For Employers",
      links: [
        { name: "Post a Job", href: "/jobs/post" },
        { name: "Pricing", href: "/pricing" },
        { name: "Recruitment Solutions", href: "/recruitment" },
        { name: "Employer Resources", href: "/employer-resources" },
        { name: "Success Stories", href: "/success-stories" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "FAQs", href: "/faq" },
        { name: "Terms of Use", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Cookie Policy", href: "/cookies" },
      ]
    }
  ]

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/jobplatform" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/jobplatform" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/jobplatform" },
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/jobplatform" },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4">

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">JobPlatform</span>
              </Link>
              <p className="text-slate-300 mb-6 max-w-sm">
                Australia's go-to job platform for young professionals. Connect with amazing opportunities and build your career.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <a href={social.href} target="_blank" rel="noopener noreferrer">
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{social.name}</span>
                      </a>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>© {currentYear} JobPlatform. All rights reserved.</span>
              <span>•</span>
              <span>Made with ❤️ in Australia</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
                <Link href="/terms">Terms</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
                <Link href="/privacy">Privacy</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
