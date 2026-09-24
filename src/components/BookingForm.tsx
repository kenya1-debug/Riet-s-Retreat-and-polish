"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

export default function BookingForm({
  services,
  type,
}: {
  services: Service[];
  type: "in_salon" | "call_in";
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const payload = {
      type,
      customer_name: String(form.get("customer_name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      service_id: String(form.get("service_id") || "") || null,
      preferred_date: String(form.get("preferred_date") || ""),
      preferred_time: String(form.get("preferred_time") || ""),
      address: type === "call_in" ? String(form.get("address") || "") : "",
      notes: String(form.get("notes") || ""),
      status: "pending" as const,
    };

    if (!payload.customer_name || !payload.phone || !payload.preferred_date || !payload.preferred_time) {
      setStatus("error");
      setErrorMsg("Please fill in your name, phone, and preferred date/time.");
      return;
    }
    if (type === "call_in" && !payload.address) {
      setStatus("error");
      setErrorMsg("Please add the address you'd like us to visit.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("bookings").insert(payload);

    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong sending your request. Please try again or WhatsApp us.");
      return;
    }

    setStatus("done");
    (e.target as HTMLFormElement).reset();
  }

  if (status === "done") {
    return (
      <div className="border border-gold/40 bg-onyx p-8 text-center">
        <p className="font-display text-2xl text-gold">Request received</p>
        <p className="mt-3 font-body text-cream/70">
          Thank you — we&rsquo;ll confirm your{" "}
          {type === "call_in" ? "home service" : "appointment"} by phone or WhatsApp shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" name="customer_name" required />
        <Field label="Phone number" name="phone" type="tel" required />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email (optional)" name="email" type="email" />
        <div>
          <label className="block font-sans text-sm text-cream/70" htmlFor="service_id">
            Service
          </label>
          <select
            id="service_id"
            name="service_id"
            className="mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 font-sans text-sm text-cream focus:border-gold"
          >
            <option value="" className="bg-ink">
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink">
                {s.name} — KES {Number(s.price_kes).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Preferred date" name="preferred_date" type="date" required />
        <Field label="Preferred time" name="preferred_time" type="time" required />
      </div>

      {type === "call_in" && (
        <Field
          label="Address / location details"
          name="address"
          as="textarea"
          placeholder="Estate, landmark, house number — anything that helps us find you"
          required
        />
      )}

      <Field
        label="Anything else we should know? (optional)"
        name="notes"
        as="textarea"
        placeholder="Allergies, reference photos, special requests..."
      />

      {status === "error" && (
        <p className="border border-red-800/50 bg-red-950/30 px-4 py-3 font-sans text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-sm bg-gold px-8 py-3 font-sans text-sm text-ink transition-colors hover:bg-gold-soft disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting"
          ? "Sending..."
          : type === "call_in"
            ? "Request home service"
            : "Confirm booking request"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  as = "input",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
  placeholder?: string;
}) {
  const className =
    "mt-2 w-full border border-gold/30 bg-transparent px-4 py-3 font-sans text-sm text-cream placeholder:text-cream/30 focus:border-gold";
  return (
    <div>
      <label className="block font-sans text-sm text-cream/70" htmlFor={name}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={name} name={name} rows={3} required={required} placeholder={placeholder} className={className} />
      ) : (
        <input id={name} name={name} type={type} required={required} placeholder={placeholder} className={className} />
      )}
    </div>
  );
}
