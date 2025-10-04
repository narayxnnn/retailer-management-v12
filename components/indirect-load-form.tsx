"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RetailerPortalSource, RetailerMailSource } from "@/lib/types"

interface IndirectLoadFormProps {
  source: "retailer portal" | "retailer mail"
  retailerPortal: RetailerPortalSource
  retailerMail: RetailerMailSource
  onSourceChange: (source: "retailer portal" | "retailer mail") => void
  onRetailerPortalChange: (data: RetailerPortalSource) => void
  onRetailerMailChange: (data: RetailerMailSource) => void
}

export function IndirectLoadForm({
  source,
  retailerPortal,
  retailerMail,
  onSourceChange,
  onRetailerPortalChange,
  onRetailerMailChange,
}: IndirectLoadFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">File Received Through</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="source">Select Source</Label>
          <Select value={source} onValueChange={onSourceChange}>
            <SelectTrigger id="source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retailer portal">Retailer Portal</SelectItem>
              <SelectItem value="retailer mail">Retailer Mail</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {source === "retailer portal" && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">Login Credentials Data</h4>
            <div>
              <Label htmlFor="websiteLink">Website Link</Label>
              <Input
                id="websiteLink"
                type="url"
                placeholder="https://example.com"
                value={retailerPortal.websiteLink}
                onChange={(e) => onRetailerPortalChange({ ...retailerPortal, websiteLink: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portalUsername">Username</Label>
                <Input
                  id="portalUsername"
                  placeholder="Username"
                  value={retailerPortal.username}
                  onChange={(e) => onRetailerPortalChange({ ...retailerPortal, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="portalPassword">Password</Label>
                <Input
                  id="portalPassword"
                  type="password"
                  placeholder="Password"
                  value={retailerPortal.password}
                  onChange={(e) => onRetailerPortalChange({ ...retailerPortal, password: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {source === "retailer mail" && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">Mail Information</h4>
            <div>
              <Label htmlFor="mailFolder">Mail Folder</Label>
              <Input
                id="mailFolder"
                placeholder="e.g., Inbox/Retailer"
                value={retailerMail.mailFolder}
                onChange={(e) => onRetailerMailChange({ ...retailerMail, mailFolder: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="mailId">Mail ID</Label>
              <Input
                id="mailId"
                type="email"
                placeholder="retailer@example.com"
                value={retailerMail.mailId}
                onChange={(e) => onRetailerMailChange({ ...retailerMail, mailId: e.target.value })}
                required
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
