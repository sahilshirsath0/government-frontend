import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation('home');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center text-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/irrigation-canal.jpg" // You'll need to add this image
          alt={t('hero.imageAlt')}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 z-10">
          {/* Main Title */}
          <h1 className="text-yellow-400 text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 leading-tight animate-fade-in">
            {t('hero.title')}
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-white text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold mb-6 leading-tight animate-fade-in-delay">
            {t('hero.subtitle')}
          </h2>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12 animate-fade-in-up">
          <h3 className="text-center text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3">
            {t('header.title')}
          </h3>
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <div className="w-3 h-3 bg-yellow-500 transform rotate-45 mx-2 shadow-lg" style={{boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)'}}></div>
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
          </div>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
            {t('header.description')}
          </p>
        </div>

        {/* Village History Section */}
        <div className="max-w-4xl mx-auto animate-fade-in-up delay-200">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-yellow-100">
            <div className="h-1 w-28 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded mb-5 mx-auto"></div>
            
            {/* Establishment Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.establishment.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.establishment.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.establishment.content.part2')}
            </p>

            {/* Religious Heritage Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.heritage.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.heritage.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.heritage.content.part2')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.heritage.content.part3')}
            </p>

            {/* Agriculture Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.agriculture.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.agriculture.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.agriculture.content.part2')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.agriculture.content.part3')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.agriculture.content.part4')}
            </p>

            {/* Education Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.education.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.education.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.education.content.part2')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.education.content.part3')}
            </p>

            {/* Social Unity Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.social.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.social.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.social.content.part2')}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-justify">
              {t('sections.social.content.part3')}
            </p>

            {/* Ideal Panchayat Section */}
            <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 text-left">
              {t('sections.ideal.title')}
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-justify">
              {t('sections.ideal.content.part1')}
            </p>
            <p className="text-gray-700 leading-relaxed text-justify">
              {t('sections.ideal.content.part2')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
