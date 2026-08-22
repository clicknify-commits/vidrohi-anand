import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("settings").select("key, value");

  const settingsMap = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const defaultCity = (settingsMap.default_weather_city as string) ?? "New Delhi";
  const socialLinks = (settingsMap.site_social_links as Record<string, string>) ?? {};

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">सेटिंग्स</h1>
      <Card>
        <CardHeader>
          <CardTitle>वेदर व सोशल लिंक</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-4">
            <div className="space-y-2">
              <Label>डिफ़ॉल्ट मौसम शहर</Label>
              <Input name="default_weather_city" defaultValue={defaultCity} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp नंबर (देश कोड सहित, बिना +)</Label>
              <Input name="whatsapp" defaultValue={socialLinks.whatsapp ?? ""} placeholder="91XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>X (Twitter) हैंडल</Label>
              <Input name="x" defaultValue={socialLinks.x ?? ""} placeholder="vidrohianand" />
            </div>
            <div className="space-y-2">
              <Label>Instagram हैंडल</Label>
              <Input name="instagram" defaultValue={socialLinks.instagram ?? ""} placeholder="vidrohianand" />
            </div>
            <div className="space-y-2">
              <Label>YouTube चैनल ID</Label>
              <Input name="youtube" defaultValue={socialLinks.youtube ?? ""} />
            </div>
            <Button type="submit">सेव करें</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
