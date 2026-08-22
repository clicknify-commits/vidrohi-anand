import type { Metadata } from "next";

export const metadata: Metadata = { title: "गोपनीयता नीति" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-neutral mx-auto max-w-3xl">
      <h1>गोपनीयता नीति</h1>
      <p>
        हम आपकी गोपनीयता का सम्मान करते हैं। इस वेबसाइट पर आपकी व्यक्तिगत जानकारी का उपयोग केवल
        बेहतर सेवा प्रदान करने के लिए किया जाता है, और इसे किसी तीसरे पक्ष के साथ साझा नहीं किया जाता।
      </p>
    </div>
  );
}
