"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("Message sent successfully!", {
      description: "We'll get back to you within 24 hours.",
      icon: <CheckCircle2 className="w-5 h-5" />,
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+91 XXXXX XXXXX",
      link: "tel:+91XXXXXXXXXX"
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@shrikailashkalamkari.com",
      link: "mailto:info@shrikailashkalamkari.com"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "Kalamkari Street, Heritage City, India",
      link: "#"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-background/30 to-secondary/10 border-b border-gray-200 py-12 md:py-16">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground">
                Get in Touch
              </h1>
            </div>
            <p className="text-base md:text-lg text-foreground/70 font-paragraph max-w-2xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
            {/* Contact Info Cards */}
            <div className="lg:col-span-4 space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-secondary/5">
                    <CardContent className="p-6">
                      <info.icon className="w-8 h-8 text-primary mb-4" />
                      <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">{info.title}</h3>
                      {info.link.startsWith('http') || info.link.startsWith('tel') || info.link.startsWith('mailto') ? (
                        <a href={info.link} className="text-foreground/70 font-paragraph hover:text-primary transition-colors duration-200">
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-foreground/70 font-paragraph">{info.content}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Business Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-secondary/5">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-lg mb-4 text-foreground">Business Hours</h3>
                    <div className="space-y-2 text-sm font-paragraph">
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Monday - Friday</span>
                        <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Saturday</span>
                        <span className="font-medium text-foreground">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Sunday</span>
                        <span className="font-medium text-foreground">Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Vertical Divider (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1 relative">
              <div className="absolute inset-y-0 left-1/2 w-px bg-border/60"></div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 md:p-10">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-foreground">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-paragraph font-medium mb-2 text-foreground">Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 font-paragraph text-foreground bg-white"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-paragraph font-medium mb-2 text-foreground">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 font-paragraph text-foreground bg-white"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-paragraph font-medium mb-2 text-foreground">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 font-paragraph text-foreground bg-white"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-paragraph font-medium mb-2 text-foreground">Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 font-paragraph text-foreground bg-white"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-paragraph font-medium mb-2 text-foreground">Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 resize-none font-paragraph text-foreground bg-white"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto bg-primary hover:bg-primary/80 focus:ring-2 focus:ring-accent text-primary-foreground px-8 py-3 font-paragraph text-base transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
