import type { Metadata } from "next";

export const metadata: Metadata = { title: "संपर्क करें" };

export default function ContactPage() {
  return (
    <div className="prose prose-neutral mx-auto max-w-3xl">
      <h1>संपर्क करें</h1>
      <p>समाचार, प्रतिक्रिया या विज्ञापन संबंधी पूछताछ के लिए हमें ईमेल करें।</p>
      <p>ईमेल: contact@vidrohianand.com</p>
    </div>
  );
}
