import type { Metadata } from "next";

export const metadata: Metadata = { title: "हमारे बारे में" };

export default function AboutPage() {
  return (
    <div className="prose prose-neutral mx-auto max-w-3xl">
      <h1>हमारे बारे में</h1>
      <p>
        विद्रोही आनंद एक हिंदी समाचार पोर्टल है, जो सत्य, निष्पक्षता और जनहित के मूल्यों पर आधारित है।
        हमारा उद्देश्य पाठकों तक सटीक और समयबद्ध समाचार पहुँचाना है।
      </p>
    </div>
  );
}
