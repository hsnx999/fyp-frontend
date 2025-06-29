import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';

const AboutUsSection: React.FC = () => {
  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Leading experts in AI-driven medical diagnostics and thoracic oncology research
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Hassan Muhammad Sharif */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
            <div className="relative mb-6">
              <img
                src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg"
                alt="Hassan Muhammad Sharif"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-400 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                <Award className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Hassan Muhammad Sharif</h3>
            <p className="text-blue-300 font-medium mb-4">Lead AI Research Engineer</p>
            
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Hassan specializes in deep learning architectures for medical imaging analysis. With expertise in 
              convolutional neural networks and computer vision, he leads the development of our CT scan analysis 
              algorithms, achieving breakthrough accuracy in thoracic cancer detection and classification.
            </p>

            <div className="flex justify-center space-x-4">
              <div className="flex items-center text-blue-200 text-xs">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>PhD Computer Science</span>
              </div>
            </div>
          </div>

          {/* Muhammad Moazam Shakeel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
            <div className="relative mb-6">
              <img
                src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg"
                alt="Muhammad Moazam Shakeel"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-400 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Muhammad Moazam Shakeel</h3>
            <p className="text-blue-300 font-medium mb-4">Clinical Data Scientist</p>
            
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Moazam bridges the gap between clinical practice and AI technology. His expertise in natural language 
              processing and clinical informatics drives our automated clinical notes analysis system, enabling 
              seamless integration of patient data with diagnostic workflows.
            </p>

            <div className="flex justify-center space-x-4">
              <div className="flex items-center text-blue-200 text-xs">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>MS Medical Informatics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-200 px-6 py-3 rounded-full">
            <Award className="h-5 w-5" />
            <span className="text-sm font-medium">Advancing Healthcare Through AI Innovation</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;