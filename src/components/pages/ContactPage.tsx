import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { ChikankariPattern, DecorativeBorder, DecorativePattern } from '@/components/ui/decorative-pattern';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-background relative">
      <ChikankariPattern className="text-primary/5" opacity="opacity-3" />
      {/* Hero Section */}
      <section className="relative w-full py-32 md:py-40 lg:py-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="https://static.wixstatic.com/media/07221c_d429380cd73a433caa954c962ce5d49e~mv2.png" alt="Kalamkari fabric texture background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
          <DecorativePattern className="text-accent-color" />
        </div>
        <div className="relative z-10 max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground mb-6 md:mb-8"
          >
            We'd Love to Hear From You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions about our sarees or need assistance? Reach out to us and we'll respond within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16 py-20 md:py-28 lg:py-32 relative z-10">
        <DecorativePattern className="text-primary/5" opacity="opacity-5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Send Us a Message</h2>
              <p className="text-lg text-foreground/70 font-paragraph mb-10 leading-relaxed">
                We're here to help with any questions about our handcrafted sarees, custom orders, or anything else you'd like to know.
              </p>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-10 text-center">
                  <p className="text-lg font-paragraph text-green-800">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-3 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-3 block">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-3 block">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-sm font-semibold text-foreground mb-3 block">
                        Subject
                      </Label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full h-12 px-4 py-3 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="">Select a subject</option>
                        <option value="product-inquiry">Product Inquiry</option>
                        <option value="order-status">Order Status</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="custom-order">Custom Order</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold text-foreground mb-3 block">
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full min-h-48 p-4"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 h-auto rounded-sm font-paragraph text-base"
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Email */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 relative">
              <DecorativeBorder position="top" className="opacity-40" />
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">Email</h3>
                  <p className="text-foreground/70 font-paragraph">
                    <a href="mailto:support@kalamkari.com" className="text-primary hover:underline transition-colors">
                      support@kalamkari.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">Phone</h3>
                  <p className="text-foreground/70 font-paragraph">
                    <a href="tel:+919876543210" className="text-primary hover:underline transition-colors">
                      +91 98765 43210
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">Business Hours</h3>
                  <div className="text-foreground/70 font-paragraph space-y-1">
                    <p>Mon - Fri: 10:00 AM - 6:00 PM</p>
                    <p>Sat: 11:00 AM - 5:00 PM</p>
                    <p>Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-bold text-foreground mb-3">Address</h3>
                  <div className="text-foreground/70 font-paragraph space-y-1">
                    <p>123 Artisan Way</p>
                    <p>Craft Village, India</p>
                    <p>PIN: 500001</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Section */}
      <section className="w-full bg-secondary/20 py-20 md:py-24 border-t border-gray-200">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Visit Our Studio</h2>
            <p className="text-lg text-foreground/70 font-paragraph max-w-2xl mx-auto">
              Experience our handcrafted sarees in person at our artisan studio in the heart of Craft Village.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 md:h-[500px] flex items-center justify-center overflow-hidden"
          >
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary/40 mx-auto mb-4" />
              <p className="text-foreground/70 font-paragraph text-lg">
                Interactive map integration would be displayed here
              </p>
              <p className="text-foreground/50 font-paragraph text-sm mt-2">
                Showing our location at 123 Artisan Way, Craft Village
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
