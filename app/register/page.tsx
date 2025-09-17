"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<"candidate" | "employer">("candidate")
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100/50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-transparent to-blue-100/30 pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
      
      {/* Enhanced card with split layout */}
      <Card className="w-full max-w-6xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden animate-fade-in-up relative z-10 py-0">
        
        <div className="grid lg:grid-cols-2 min-h-[700px]">
          {/* Left side - Form */}
          <div className="flex flex-col justify-center">
              <div className="w-full px-8">
                <div className="animate-fade-in-up">
                  <RegisterForm onRoleChange={setSelectedRole} />
                </div>
              
            </div>
          </div>
          
          {/* Right side - Illustration */}
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center rounded-l-full border-l border-gray-200 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-900/80"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            
            {/* Main illustration */}
            <div className="relative z-10 animate-bounce-in flex flex-col items-center justify-center h-full">
                  {/* Register image */}
                  <div className="relative">
                    <div className="w-120 h-120 bg-blue-100 rounded-full overflow-hidden shadow-lg flex items-center justify-center">
                      <img 
                        src={selectedRole === "employer" ? "/employeer.png" : "/jobseeker.png"} 
                        alt="Register illustration" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
              
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}