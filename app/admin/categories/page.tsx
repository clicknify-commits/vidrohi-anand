import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  deleteTag,
} from "./actions";
import type { Category, Tag } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("tags").select("*").order("name"),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">श्रेणियाँ प्रबंधित करें</h1>

      <Card>
        <CardHeader>
          <CardTitle>श्रेणियाँ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">हिंदी नाम</th>
                  <th className="p-2">अंग्रेज़ी नाम</th>
                  <th className="p-2">स्लग</th>
                  <th className="p-2">क्रम</th>
                  <th className="p-2">सक्रिय</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {(categories as Category[] | null)?.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0">
                    <td colSpan={6} className="p-0">
                      <form
                        action={updateCategory}
                        className="flex flex-wrap items-center gap-2 p-2"
                      >
                        <input type="hidden" name="id" value={cat.id} />
                        <Input name="name_hi" defaultValue={cat.name_hi} className="w-32" />
                        <Input name="name_en" defaultValue={cat.name_en} className="w-32" />
                        <Input name="slug" defaultValue={cat.slug} className="w-36" />
                        <Input
                          name="sort_order"
                          type="number"
                          defaultValue={cat.sort_order}
                          className="w-16"
                        />
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Checkbox name="is_active" defaultChecked={cat.is_active} />
                          सक्रिय
                        </label>
                        <Button type="submit" size="sm" variant="outline">
                          सेव करें
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          formAction={deleteCategory}
                          className="text-destructive"
                        >
                          हटाएँ
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={createCategory} className="flex flex-wrap items-end gap-2 border-t pt-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">हिंदी नाम</label>
              <Input name="name_hi" required className="w-32" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">अंग्रेज़ी नाम</label>
              <Input name="name_en" required className="w-32" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">स्लग (खाली छोड़ें तो अपने आप बनेगा)</label>
              <Input name="slug" className="w-36" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">क्रम</label>
              <Input name="sort_order" type="number" defaultValue={0} className="w-16" />
            </div>
            <Button type="submit">+ नई श्रेणी जोड़ें</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>टैग</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(tags as Tag[] | null)?.map((tag) => (
              <form key={tag.id} action={deleteTag} className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm">
                <input type="hidden" name="id" value={tag.id} />
                <span>{tag.name}</span>
                <button type="submit" className="text-muted-foreground hover:text-destructive" aria-label={`${tag.name} हटाएँ`}>
                  ×
                </button>
              </form>
            ))}
            {tags?.length === 0 ? (
              <p className="text-sm text-muted-foreground">अभी कोई टैग नहीं है।</p>
            ) : null}
          </div>
          <form action={createTag} className="flex items-end gap-2 border-t pt-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">नया टैग</label>
              <Input name="name" required className="w-48" />
            </div>
            <Button type="submit">+ जोड़ें</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
