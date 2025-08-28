import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Get all projects
    const projects = await db.collection("projects").find({}).toArray()
    
    // Calculate stats
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const planningProjects = projects.filter(p => p.status === 'planning').length
    const onHoldProjects = projects.filter(p => p.status === 'on-hold').length
    const cancelledProjects = projects.filter(p => p.status === 'cancelled').length
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalAllocated = projects.reduce((sum, p) => sum + (p.allocated || 0), 0)
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0)
    const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.beneficiaries || 0), 0)
    
    const averageProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
      : 0

    // Get this month's projects
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const thisMonthProjects = projects.filter(p => 
      new Date(p.createdAt) >= firstDayOfMonth
    ).length

    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      cancelledProjects,
      thisMonthProjects,
      totalBudget,
      totalAllocated,
      totalSpent,
      totalBeneficiaries,
      averageProgress,
      budgetUtilization: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
      completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching project stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    )
  }
}