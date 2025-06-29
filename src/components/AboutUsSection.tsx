import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';
import { useScrollAnimation, useParallaxScroll } from '../hooks/useScrollAnimation';

const AboutUsSection: React.FC = () => {
  const { elementRef: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  const { elementRef: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  const { elementRef: card1Ref, isVisible: card1Visible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
  });

  const { elementRef: card2Ref, isVisible: card2Visible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
  });

  const { elementRef: footerRef, isVisible: footerVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '0px 0px 100px 0px'
  });

  const scrollY = useParallaxScroll();

  return (
    <section 
      ref={sectionRef}
      className={`relative py-20 bg-gradient-to-b from-slate-900 to-blue-950 overflow-hidden transition-all duration-1000 ease-out ${
        sectionVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundPosition: `center ${scrollY * 0.3}px`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-all duration-2000 ease-out ${
            sectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            transform: `translateY(${scrollY * 0.15}px) scale(${sectionVisible ? 1 : 0.75})`,
          }}
        />
        <div 
          className={`absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-2000 ease-out delay-300 ${
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
            Meet Our Team
          </h2>
          <p className="text-blue-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Leading experts in AI-driven medical diagnostics and thoracic oncology research, 
            pioneering the future of healthcare technology
          </p>
        </div>

        {/* Team Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Hassan Muhammad Sharif */}
          <div 
            ref={card1Ref}
            className={`group relative transition-all duration-1000 ease-out ${
              card1Visible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-full'
            }`}
            style={{ transitionDelay: card1Visible ? '200ms' : '0ms' }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="relative mb-8">
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg"
                    alt="Hassan Muhammad Sharif"
                    className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-blue-400 shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 w-36 h-36 rounded-full mx-auto bg-gradient-to-tr from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-x-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                Hassan Muhammad Sharif
              </h3>
              <p className="text-blue-300 font-semibold mb-6 text-lg">AI & Computer Vision Specialist</p>
              
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 opacity-90">
                Final-year BSc Software Engineering student specializing in machine learning and computer vision. 
                Hassan has developed expertise in deep learning frameworks like TensorFlow and PyTorch, focusing on 
                medical image analysis. His capstone project involves creating CNN architectures for automated 
                thoracic cancer detection from CT scans.
              </p>

              <div className="space-y-4">
                <div className="flex justify-center items-center text-blue-200 text-sm">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-medium">BSc Software Engineering (Final Year)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Muhammad Moazam Shakeel */}
          <div 
            ref={card2Ref}
            className={`group relative transition-all duration-1000 ease-out ${
              card2Visible 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-full'
            }`}
            style={{ transitionDelay: card2Visible ? '400ms' : '0ms' }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="relative mb-8">
                <div className="relative">
                  <img
                    src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg"
                    alt="Muhammad Moazam Shakeel"
                    className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-green-400 shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 w-36 h-36 rounded-full mx-auto bg-gradient-to-tr from-green-400/20 to-blue-400/20 animate-pulse"></div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-x-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors duration-300">
                Muhammad Moazam Shakeel
              </h3>
              <p className="text-green-300 font-semibold mb-6 text-lg">Full-Stack Developer & NLP Engineer</p>
              
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 opacity-90">
                Final-year BSc Software Engineering student with a passion for healthcare technology and natural 
                language processing. Moazam combines his software development skills with AI to build the clinical 
                notes analysis system, utilizing React, Node.js, and Python NLP libraries to create seamless 
                user experiences for medical professionals.
              </p>

              <div className="space-y-4">
                <div className="flex justify-center items-center text-blue-200 text-sm">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-medium">BSc Software Engineering (Final Year)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div 
          ref={footerRef}
          className={`text-center mt-16 transition-all duration-1000 ease-out ${
            footerVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: footerVisible ? '600ms' : '0ms' }}
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-200 px-8 py-4 rounded-full border border-blue-400/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <Award className="h-6 w-6" />
            <span className="text-base font-medium">Advancing Healthcare Through AI Innovation</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;