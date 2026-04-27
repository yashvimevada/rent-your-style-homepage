import { useState } from "react";
import { Phone, Mail, Send, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in Name, Email and Message");
      return;
    }
    setIsSubmitting(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success("Message sent! We'll get back to you soon.");
  };

  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      lines: ["+91 7600317567", "+91 9313081273"],
      action: "tel:+917600317567",
      color: "bg-green-50 text-green-600",
      hoverColor: "hover:bg-green-100",
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["yashvimevada23@gmail.com"],
      action: "mailto:yashvimevada23@gmail.com",
      color: "bg-blue-50 text-blue-600",
      hoverColor: "hover:bg-blue-100",
    },
  ];

  const faqs = [
    { q: "How does outfit rental work?", a: "Browse our collection, select your outfit, choose rental dates, and we deliver it to your door. Return it after your event — we handle the cleaning!" },
    { q: "What sizes are available?", a: "We offer sizes from XS to 3XL. Each outfit listing shows exact measurements. Our team also helps with fit guidance." },
    { q: "What's the rental duration?", a: "Standard rentals are 3-5 days. Need it longer? Extended rentals are available at a small daily fee." },
    { q: "What if the outfit doesn't fit?", a: "We offer free size exchanges when you order 3+ days before your event. Emergency alterations are available in select cities." },
    { q: "How do I return outfits?", a: "Schedule a pickup through your dashboard or drop it at our nearest partner store. Returns include a pre-paid shipping label." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgOGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            We'd love to hear from you
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 font-display">
            Contact Us
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Have questions about rentals? Need help with your order? Our team is here for you.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {contactCards.map(({ icon: Icon, title, lines, action, color, hoverColor }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 ${hoverColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              {lines.map((line, i) => (
                action ? (
                  <a key={i} href={action} className="block text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    {line}
                  </a>
                ) : (
                  <p key={i} className="text-sm text-gray-500">{line}</p>
                )
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form + FAQ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-500 mb-6">Fill the form and we'll respond within 24 hours.</p>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                <Button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  variant="outline"
                  className="rounded-full"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-gray-700 font-medium text-sm">Full Name *</Label>
                    <Input
                      id="contact-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="h-11 rounded-xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-gray-700 font-medium text-sm">Email *</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="h-11 rounded-xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-gray-700 font-medium text-sm">Phone</Label>
                    <Input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXXXXXXX"
                      className="h-11 rounded-xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject" className="text-gray-700 font-medium text-sm">Subject</Label>
                    <Input
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Rental inquiry"
                      className="h-11 rounded-xl border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-gray-700 font-medium text-sm">Message *</Label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 px-3 py-2.5 text-sm resize-none outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 transition-all"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Message</>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 mb-6">Quick answers to common questions.</p>
            <div className="space-y-4">
              {faqs.map(({ q, a }, i) => (
                <details key={i} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer text-gray-900 font-semibold text-sm hover:text-rose-500 transition-colors list-none">
                    {q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform duration-200 text-xl font-light ml-4 shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>

            {/* Quick CTA */}
            <div className="mt-8 bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Need Urgent Help?</h3>
              <p className="text-white/80 text-sm mb-4">Call us directly for instant support.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:+917600317567"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-rose-600 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +91 7600317567
                </a>
                <a
                  href="tel:+919313081273"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white rounded-full font-semibold text-sm hover:bg-white/25 transition-colors border border-white/30"
                >
                  <Phone className="w-4 h-4" />
                  +91 9313081273
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
