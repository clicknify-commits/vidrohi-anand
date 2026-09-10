export type Lang = "hi" | "en";

export const LANG_COOKIE = "va_lang";

const dict = {
  "nav.brand": { hi: "विद्रोही आनंद", en: "Vidrohi Anand" },
  "nav.dashboard": { hi: "डैशबोर्ड", en: "Dashboard" },
  "nav.articles": { hi: "समाचार", en: "Articles" },
  "nav.media": { hi: "मीडिया लाइब्रेरी", en: "Media Library" },
  "nav.categories": { hi: "श्रेणियाँ", en: "Categories" },
  "nav.authors": { hi: "लेखक", en: "Authors" },
  "nav.settings": { hi: "सेटिंग्स", en: "Settings" },
  "nav.logout": { hi: "लॉगआउट", en: "Log out" },

  "status.draft": { hi: "ड्राफ्ट", en: "Draft" },
  "status.in_review": { hi: "समीक्षा में", en: "In review" },
  "status.scheduled": { hi: "शेड्यूल्ड", en: "Scheduled" },
  "status.published": { hi: "प्रकाशित", en: "Published" },
  "status.archived": { hi: "आर्काइव्ड", en: "Archived" },

  "common.save": { hi: "सेव करें", en: "Save" },
  "common.delete": { hi: "हटाएँ", en: "Delete" },
  "common.cancel": { hi: "रद्द करें", en: "Cancel" },
  "common.add": { hi: "जोड़ें", en: "Add" },
  "common.active": { hi: "सक्रिय", en: "Active" },
  "common.none": { hi: "अभी कोई नहीं है।", en: "Nothing here yet." },
  "common.all": { hi: "सभी", en: "All" },
  "common.updated": { hi: "अपडेटेड", en: "Updated" },

  "dashboard.title": { hi: "डैशबोर्ड", en: "Dashboard" },
  "dashboard.newStory": { hi: "+ नई स्टोरी", en: "+ New story" },
  "dashboard.viewAll": { hi: "सभी स्टोरी देखें", en: "View all stories" },
  "dashboard.mediaLibrary": { hi: "मीडिया लाइब्रेरी", en: "Media library" },
  "dashboard.manageCategories": { hi: "श्रेणियाँ प्रबंधित करें", en: "Manage categories" },

  "articles.title": { hi: "सभी स्टोरी", en: "All articles" },
  "articles.headline": { hi: "शीर्षक", en: "Headline" },
  "articles.category": { hi: "श्रेणी", en: "Category" },
  "articles.status": { hi: "स्टेटस", en: "Status" },
  "articles.noneYet": { hi: "अभी कोई स्टोरी नहीं है।", en: "No articles yet." },
  "articles.deleteConfirmTitle": { hi: "स्टोरी हटाएँ?", en: "Delete this story?" },
  "articles.deleteConfirmBody": {
    hi: "यह स्टोरी और इसकी सभी छवियाँ स्थायी रूप से हट जाएँगी। यह पूर्ववत नहीं किया जा सकता।",
    en: "This story and all its images will be permanently deleted. This cannot be undone.",
  },
  "articles.deleted": { hi: "स्टोरी हट गई", en: "Story deleted" },
  "articles.deleteFailed": { hi: "स्टोरी हटाई नहीं जा सकी", en: "Could not delete the story" },

  "composer.headlinePlaceholder": { hi: "शीर्षक", en: "Headline" },
  "composer.charsSuggestion": { hi: "अक्षर (सुझाव: 50-70)", en: "characters (suggested: 50-70)" },
  "composer.saveNow": { hi: "अभी सेव करें", en: "Save now" },
  "composer.saved": { hi: "सेव हो गया", en: "Saved" },
  "composer.tabStory": { hi: "स्टोरी", en: "Story" },
  "composer.tabImages": { hi: "छवियाँ", en: "Images" },
  "composer.tabSeo": { hi: "SEO", en: "SEO" },
  "composer.tabPublish": { hi: "प्रकाशन", en: "Publish" },
  "composer.dek": { hi: "देक / उप-शीर्षक", en: "Dek / subheading" },
  "composer.categoryRequired": { hi: "श्रेणी *", en: "Category *" },
  "composer.cityTag": { hi: "शहर / राज्य टैग", en: "City / state tag" },
  "composer.slug": { hi: "URL स्लग", en: "URL slug" },
  "composer.author": { hi: "लेखक", en: "Author" },
  "composer.authorNone": { hi: "कोई नहीं चुना गया", en: "No author selected" },
  "composer.guestByline": { hi: "बायलाइन ओवरराइड (वैकल्पिक - लेखक के नाम की जगह दिखेगा)", en: "Byline override (optional - shows instead of the selected author's name)" },
  "composer.tagsMax": { hi: "टैग (अधिकतम 6)", en: "Tags (max 6)" },
  "composer.body": { hi: "मुख्य लेख", en: "Article body" },
  "composer.beforePublish": { hi: "प्रकाशन/समीक्षा से पहले पूरा करें:", en: "Complete before review/publish:" },
  "composer.backToAll": { hi: "← सभी स्टोरी", en: "← All articles" },
  "composer.versionHistory": { hi: "वर्ज़न हिस्ट्री", en: "Version history" },

  "images.slotMissing": { hi: "स्लॉट {position}: कोई छवि नहीं है", en: "Slot {position}: no image" },
  "images.altRequired": { hi: "स्लॉट {position}: ऑल्ट टेक्स्ट आवश्यक है", en: "Slot {position}: alt text required" },
  "images.featured": { hi: "फ़ीचर्ड छवि (स्लॉट 1)", en: "Featured image (slot 1)" },
  "images.gallery": { hi: "गैलरी छवि (स्लॉट {position})", en: "Gallery image (slot {position})" },
  "images.remove": { hi: "हटाएँ", en: "Remove" },
  "images.choose": { hi: "+ छवि चुनें", en: "+ Choose image" },
  "images.uploading": { hi: "अपलोड हो रहा है…", en: "Uploading…" },
  "images.uploaded": { hi: "स्लॉट {position} अपलोड हो गया", en: "Slot {position} uploaded" },
  "images.uploadFailed": { hi: "अपलोड विफल", en: "Upload failed" },
  "images.altPlaceholder": { hi: "ऑल्ट टेक्स्ट (आवश्यक)", en: "Alt text (required)" },
  "images.captionPlaceholder": { hi: "कैप्शन", en: "Caption" },
  "images.creditPlaceholder": { hi: "क्रेडिट / स्रोत", en: "Credit / source" },
  "images.saving": { hi: "सेव हो रहा है…", en: "Saving…" },
  "images.focalHint": { hi: "फ़ोकल पॉइंट सेट करने के लिए क्लिक करें", en: "Click to set the focal point" },
  "images.recommendedSize": {
    hi: "सुझाव: कम से कम {w}x{h}px - Google News में बड़ी छवि दिखाने के लिए (अनिवार्य नहीं)",
    en: "Recommended: at least {w}x{h}px - for Google News large-image eligibility (not required)",
  },
  "images.currentSize": { hi: "मौजूदा आकार: {w}x{h}px", en: "Current size: {w}x{h}px" },

  "seo.title": { hi: "SEO शीर्षक", en: "SEO title" },
  "seo.titleHint": { hi: "अक्षर - खाली छोड़ने पर मुख्य शीर्षक उपयोग होगा", en: "characters - leave empty to use the main headline" },
  "seo.description": { hi: "मेटा विवरण", en: "Meta description" },
  "seo.descriptionChars": { hi: "अक्षर", en: "characters" },
  "seo.focusKeyword": { hi: "फोकस कीवर्ड", en: "Focus keyword" },
  "seo.canonicalUrl": { hi: "कैनोनिकल URL (वायर/सिंडिकेटेड स्टोरी के लिए)", en: "Canonical URL (for wire/syndicated stories)" },
  "seo.indexTitle": { hi: "सर्च इंजन में इंडेक्स करें", en: "Index in search engines" },
  "seo.indexHint": { hi: "बंद करने पर robots noindex टैग जुड़ेगा", en: "Turning this off adds a robots noindex tag" },
  "seo.preview": { hi: "Google खोज पूर्वावलोकन", en: "Google search preview" },
  "seo.titlePlaceholder": { hi: "शीर्षक…", en: "Title…" },
  "seo.descriptionPlaceholder": { hi: "मेटा विवरण खाली है - लेख के पहले अंश से स्वतः बनेगा।", en: "Meta description is empty - will auto-generate from the article's opening lines." },

  "publish.currentStatus": { hi: "वर्तमान स्टेटस", en: "Current status" },
  "publish.breakingNews": { hi: "ब्रेकिंग न्यूज़", en: "Breaking news" },
  "publish.sendToReview": { hi: "समीक्षा में भेजें", en: "Send to review" },
  "publish.publishNow": { hi: "अभी प्रकाशित करें", en: "Publish now" },
  "publish.archive": { hi: "आर्काइव करें", en: "Archive" },
  "publish.duplicate": { hi: "फॉलो-अप के रूप में डुप्लिकेट करें", en: "Duplicate as follow-up" },
  "publish.scheduleLabel": { hi: "शेड्यूल करें (तारीख़ व समय)", en: "Schedule (date & time)" },
  "publish.schedule": { hi: "शेड्यूल करें", en: "Schedule" },
  "publish.statusChangeFailed": { hi: "स्टेटस बदला नहीं जा सका", en: "Status could not be changed" },
  "publish.updated": { hi: "अपडेट हो गया", en: "Updated" },
  "publish.duplicated": { hi: "फॉलो-अप ड्राफ्ट बन गया", en: "Follow-up draft created" },
  "publish.duplicateFailed": { hi: "फेल हो गया", en: "Failed" },
  "publish.deleteArticle": { hi: "स्टोरी हटाएँ", en: "Delete story" },

  "categories.title": { hi: "श्रेणियाँ प्रबंधित करें", en: "Manage categories" },
  "categories.categories": { hi: "श्रेणियाँ", en: "Categories" },
  "categories.nameHi": { hi: "हिंदी नाम", en: "Hindi name" },
  "categories.nameEn": { hi: "अंग्रेज़ी नाम", en: "English name" },
  "categories.slug": { hi: "स्लग", en: "Slug" },
  "categories.slugHint": { hi: "स्लग (खाली छोड़ें तो अपने आप बनेगा)", en: "Slug (auto-generated if left empty)" },
  "categories.order": { hi: "क्रम", en: "Order" },
  "categories.addNew": { hi: "+ नई श्रेणी जोड़ें", en: "+ Add category" },
  "categories.tags": { hi: "टैग", en: "Tags" },
  "categories.newTag": { hi: "नया टैग", en: "New tag" },
  "categories.noTags": { hi: "अभी कोई टैग नहीं है।", en: "No tags yet." },

  "media.title": { hi: "मीडिया लाइब्रेरी", en: "Media library" },
  "media.noneUploaded": { hi: "अभी कोई छवि अपलोड नहीं हुई है।", en: "No images uploaded yet." },
  "media.slot": { hi: "स्लॉट {position}", en: "Slot {position}" },

  "settings.title": { hi: "सेटिंग्स", en: "Settings" },
  "settings.weatherSocial": { hi: "वेदर व सोशल लिंक", en: "Weather & social links" },
  "settings.defaultCity": { hi: "डिफ़ॉल्ट मौसम शहर", en: "Default weather city" },
  "settings.whatsapp": { hi: "WhatsApp नंबर (देश कोड सहित, बिना +)", en: "WhatsApp number (with country code, no +)" },
  "settings.x": { hi: "X (Twitter) हैंडल", en: "X (Twitter) handle" },
  "settings.instagram": { hi: "Instagram हैंडल", en: "Instagram handle" },
  "settings.youtube": { hi: "YouTube चैनल ID", en: "YouTube channel ID" },

  "authors.title": { hi: "लेखक प्रबंधित करें", en: "Manage authors" },
  "authors.name": { hi: "नाम", en: "Name" },
  "authors.bio": { hi: "परिचय / बायो", en: "Bio" },
  "authors.addNew": { hi: "+ नया लेखक जोड़ें", en: "+ Add author" },
  "authors.namePlaceholder": { hi: "लेखक का नाम", en: "Author name" },
  "authors.noneYet": { hi: "अभी कोई लेखक नहीं है।", en: "No authors yet." },
  "authors.socialLinks": { hi: "सोशल लिंक", en: "Social links" },

  "history.title": { hi: "वर्ज़न हिस्ट्री", en: "Version history" },
  "history.restore": { hi: "पुनर्स्थापित करें", en: "Restore" },
  "history.noneYet": { hi: "अभी कोई वर्ज़न सेव नहीं हुआ है।", en: "No version saved yet." },

  "editor.linkPrompt": { hi: "लिंक का URL डालें", en: "Enter the link URL" },
  "editor.insertImage": { hi: "छवि डालें", en: "Insert image" },
  "editor.imageUploadFailed": { hi: "छवि अपलोड नहीं हो सकी", en: "Image could not be uploaded" },
  "editor.dropHint": { hi: "छवि यहाँ खींचकर छोड़ें या पेस्ट करें", en: "Drag & drop or paste an image here" },
  "editor.deleteImage": { hi: "चयनित छवि हटाएँ", en: "Delete selected image" },
  "media.deleteConfirmTitle": { hi: "छवि हटाएँ?", en: "Delete this image?" },
  "media.deleted": { hi: "छवि हट गई", en: "Image deleted" },
  "media.deleteFailed": { hi: "छवि हटाई नहीं जा सकी", en: "Could not delete the image" },
} as const satisfies Record<string, Record<Lang, string>>;

export type TranslationKey = keyof typeof dict;

export function t(lang: Lang, key: TranslationKey, vars?: Record<string, string | number>): string {
  let str: string = dict[key][lang];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}
