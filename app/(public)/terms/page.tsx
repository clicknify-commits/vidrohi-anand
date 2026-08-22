import type { Metadata } from "next";

export const metadata: Metadata = { title: "नियम व शर्तें" };

export default function TermsPage() {
  return (
    <div className="prose prose-neutral mx-auto max-w-3xl">
      <h1>नियम व शर्तें</h1>
      <p>
        इस वेबसाइट का उपयोग करके, आप हमारी नियम व शर्तों से सहमत होते हैं। सभी सामग्री विद्रोही आनंद
        की संपत्ति है, जब तक अन्यथा न बताया जाए।
      </p>
    </div>
  );
}
