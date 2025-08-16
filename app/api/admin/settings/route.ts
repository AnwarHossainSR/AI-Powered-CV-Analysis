import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single()

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase
      .from("settings")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true })

    if (category) {
      query = query.eq("category", category)
    }

    const { data: settings, error } = await query

    if (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    return NextResponse.json({ settings: settings || [] })
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super admin
    const { data: adminUser } = await supabase.from("admin_users").select("role").eq("id", user.id).single()

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 })
    }

    // Update settings one by one
    const updatePromises = settings.map(async (setting: any) => {
      const { data, error } = await supabase
        .from("settings")
        .update({ value: setting.value })
        .eq("category", setting.category)
        .eq("key", setting.key)

      if (error) {
        console.error(`Error updating setting ${setting.category}.${setting.key}:`, error)
        throw error
      }

      return data
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
