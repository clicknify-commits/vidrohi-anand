import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "./actions";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";

export default async function SettingsPage() {
  const lang = await getLanguage();
  const supabase = await createClient();
  const { data: rows } = await supabase.from("settings").select("key, value");

  const settingsMap = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  const defaultCity = (settingsMap.default_weather_city as string) ?? "New Delhi";
  const socialLinks = (settingsMap.site_social_links as Record<string, string>) ?? {};

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang, "settings.title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t(lang, "settings.weatherSocial")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-4">
            <div className="space-y-2">
              <Label>{t(lang, "settings.defaultCity")}</Label>
              <Input name="default_weather_city" defaultValue={defaultCity} />
            </div>
            <div className="space-y-2">
              <Label>{t(lang, "settings.whatsapp")}</Label>
              <Input name="whatsapp" defaultValue={socialLinks.whatsapp ?? ""} placeholder="91XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>{t(lang, "settings.x")}</Label>
              <Input name="x" defaultValue={socialLinks.x ?? ""} placeholder="vidrohianand" />
            </div>
            <div className="space-y-2">
              <Label>{t(lang, "settings.instagram")}</Label>
              <Input name="instagram" defaultValue={socialLinks.instagram ?? ""} placeholder="vidrohianand" />
            </div>
            <div className="space-y-2">
              <Label>{t(lang, "settings.youtube")}</Label>
              <Input name="youtube" defaultValue={socialLinks.youtube ?? ""} />
            </div>
            <Button type="submit">{t(lang, "common.save")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
