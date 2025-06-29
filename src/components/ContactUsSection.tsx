import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Linkedin, CheckCircle, AlertCircle } from 'lucide-react';
import { useScrollAnimation, useParallaxScroll } from '../hooks/useScrollAnimation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';

const ContactUsSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { elementRef: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  const { elementRef: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  const { elementRef: contactInfoRef, isVisible: contactInfoVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
  });

  const { elementRef: formRef, isVisible: formVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
  });

  const scrollY = useParallaxScroll();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden transition-all duration-1000 ease-out ${
        sectionVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundPosition: `center ${scrollY * 0.3}px`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-32 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-all duration-2000 ease-out ${
            sectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            transform: `translateY(${scrollY * 0.15}px) scale(${sectionVisible ? 1 : 0.75})`,
          }}
        />
        <div 
          className={`absolute bottom-32 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-2000 ease-out delay-300 ${
            sectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.15}px) scale(${sectionVisible ? 1 : 0.75})`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div 
          ref={titleRef}
          className={`text-center mb-16 transition-all duration-1000 ease-out ${
            titleVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-blue-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Get in touch with our team for inquiries, support, or collaboration opportunities. 
            We're here to help advance healthcare through AI innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div 
            ref={contactInfoRef}
            className={`space-y-8 transition-all duration-1000 ease-out ${
              contactInfoVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-full'
            }`}
            style={{ transitionDelay: contactInfoVisible ? '200ms' : '0ms' }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <MessageSquare className="h-7 w-7 mr-3 text-blue-400" />
                Get In Touch
              </h3>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start space-x-4 group">
                  <div className="bg-blue-500/20 p-3 rounded-full group-hover:bg-blue-500/30 transition-colors duration-300">
                    <Mail className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Email Address</h4>
                    <p className="text-blue-200">70124718@student.uol.edu.pk</p>
                    <p className="text-blue-300 text-sm">For general inquiries and support</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4 group">
                  <div className="bg-green-500/20 p-3 rounded-full group-hover:bg-green-500/30 transition-colors duration-300">
                    <Phone className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Phone Number</h4>
                    <p className="text-blue-200">+92 300 1234567</p>
                    <p className="text-blue-300 text-sm">Available for project inquiries</p>
                  </div>
                </div>

                {/* University */}
                <div className="flex items-start space-x-4 group">
                  <div className="bg-purple-500/20 p-3 rounded-full group-hover:bg-purple-500/30 transition-colors duration-300">
                    <MapPin className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">University</h4>
                    <p className="text-blue-200">Final Year BSc Software Engineering</p>
                    <p className="text-blue-200">Computer Science Department</p>
                    <p className="text-blue-300 text-sm">Academic project collaboration</p>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-start space-x-4 group">
                  <div className="bg-orange-500/20 p-3 rounded-full group-hover:bg-orange-500/30 transition-colors duration-300">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Availability</h4>
                    <p className="text-blue-200">Available for project discussions</p>
                    <p className="text-blue-200">Response time: Within 24 hours</p>
                    <p className="text-blue-300 text-sm">Best reached via email</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8 pt-8 border-t border-white/20">
                <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5 text-blue-400" />
                  </a>
                </div>
                <p className="text-blue-300 text-sm mt-3">
                  Follow our professional journey and project updates
                </p>
              </div>
            </div>

            {/* Response Time Notice */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-400/30 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold mb-1">Response Time</h4>
                  <p className="text-blue-200 text-sm">
                    We typically respond to all inquiries within 24 hours. 
                    For academic collaboration or project discussions, please include relevant details in your message.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div 
            ref={formRef}
            className={`transition-all duration-1000 ease-out ${
              formVisible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-full'
            }`}
            style={{ transitionDelay: formVisible ? '400ms' : '0ms' }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Send className="h-7 w-7 mr-3 text-purple-400" />
                Send us a Message
              </h3>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-300 font-semibold">Message sent successfully!</p>
                    <p className="text-green-200 text-sm">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-semibold">Error sending message</p>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-blue-200 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-blue-200 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400 focus:ring-blue-400/50"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>

              <p className="text-blue-300 text-sm mt-4 text-center">
                * Required fields. All information is kept confidential and secure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;