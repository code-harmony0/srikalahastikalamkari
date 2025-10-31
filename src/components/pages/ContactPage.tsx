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
      <section className="relative w-full py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="https://static.wixstatic.com/media/07221c_d429380cd73a433caa954c962ce5d49e~mv2.png" alt="Kalamkari fabric texture background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40"></div>
          <DecorativePattern className="text-accent-color" />
        </div>
        <div className="relative z-10 max-w-[100rem] mx-auto px-4 md:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-heading font-bold text-primary-foreground mb-4"
          >
            We'd Love to Hear From You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto"
          >
            Have questions about our sarees or need assistance? Reach out to us and we'll respond within 24 hours.
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-16 md:py-24 relative z-10">
        <DecorativePattern className="text-primary/5" opacity="opacity-5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h2 className="text-3xl font-heading font-bold text-foreground mb-8">Send Us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <p className="text-lg font-paragraph text-green-800">
                  Thank you for your message! We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-2 block">
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
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
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
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-semibold text-foreground mb-2 block">
                      Subject
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
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
                  <Label htmlFor="message" className="text-sm font-semibold text-foreground mb-2 block">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full min-h-40"
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm font-paragraph"
                >
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Email */}
            <div className="bg-white rounded-lg p-6 shadow-sm relative">
              <DecorativeBorder position="top" className="opacity-40" />
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">Email</h3>
                  <p className="text-foreground/70 font-paragraph">
                    <a href="mailto:support@kalamkari.com" className="text-primary hover:underline">
                      support@kalamkari.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">Phone</h3>
                  <p className="text-foreground/70 font-paragraph">
                    <a href="tel:+919876543210" className="text-primary hover:underline">
                      +91 98765 43210
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">Business Hours</h3>
                  <p className="text-foreground/70 font-paragraph text-sm">
                    Mon - Fri: 10:00 AM - 6:00 PM<br />
                    Sat: 11:00 AM - 5:00 PM<br />
                    Sun: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-foreground mb-2">Address</h3>
                  <p className="text-foreground/70 font-paragraph text-sm">
                    123 Artisan Way<br />
                    Craft Village, India<br />
                    PIN: 500001
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Section */}
      <section className="w-full bg-gray-100 py-12">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-300 rounded-lg h-96 flex items-center justify-center"
          >
            <p className="text-foreground/70 font-paragraph">
              Map integration would go here
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
