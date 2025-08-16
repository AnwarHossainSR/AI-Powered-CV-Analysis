"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Database, Key, Mail, Shield, Palette } from "lucide-react"
import { useEffect, useState } from "react"
import { useAdminSettings, useUpdateAdminSettings } from "@/lib/hooks/use-query-hooks"

interface Setting {
  id: string
  category: string
  key: string
  value: string
  description: string
  type: string
  is_public: boolean
}

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading: loading } = useAdminSettings()
  const settings = settingsData?.settings || []

  const updateMutation = useUpdateAdminSettings()

  const [localSettings, setLocalSettings] = useState<Setting[]>([])

  useEffect(() => {
    if (settings.length > 0) {
      setLocalSettings(settings)
    }
  }, [settings])

  const updateSetting = (category: string, key: string, value: string) => {
    setLocalSettings((prev) =>
      prev.map((setting) => (setting.category === category && setting.key === key ? { ...setting, value } : setting)),
    )
  }

  const saveSettings = async () => {
    try {
      await updateMutation.mutateAsync(localSettings)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter((setting) => setting.category === category)
  }

  const renderSettingInput = (setting: Setting) => {
    const value = setting.value || ""

    switch (setting.type) {
      case "boolean":
        return (
          <Switch
            checked={value === "true"}
            onCheckedChange={(checked) => updateSetting(setting.category, setting.key, checked.toString())}
          />
        )
      case "password":
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => updateSetting(setting.category, setting.key, e.target.value)}
            placeholder="••••••••••••••••"
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateSetting(setting.category, setting.key, e.target.value)}
          />
        )
      case "email":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => updateSetting(setting.category, setting.key, e.target.value)}
          />
        )
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateSetting(setting.category, setting.key, e.target.value)}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Configure system settings and integrations.</p>
      </div>

      <div className="space-y-6">
        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Configuration
            </CardTitle>
            <CardDescription>Core system settings and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getSettingsByCategory("system").map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{setting.description}</label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              AI Configuration
            </CardTitle>
            <CardDescription>Configure AI processing settings and parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getSettingsByCategory("ai").map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{setting.description}</label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Configuration
            </CardTitle>
            <CardDescription>Configure email notifications and SMTP settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getSettingsByCategory("email").map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{setting.description}</label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Payment Configuration
            </CardTitle>
            <CardDescription>Stripe payment processing settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getSettingsByCategory("stripe").map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{setting.description}</label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* UI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              UI Configuration
            </CardTitle>
            <CardDescription>Customize the appearance and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {getSettingsByCategory("ui").map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{setting.description}</label>
                  {renderSettingInput(setting)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Changes */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={updateMutation.isLoading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {updateMutation.isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  )
}
