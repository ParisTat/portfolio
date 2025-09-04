import React, { useState, useEffect } from 'react';

const dynamicWords = ["Experiences", "Solutions", "Web Apps"];

const Hero: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = dynamicWords[wordIndex];
      const updatedText = isDeleting
        ? currentWord.substring(0, text.length - 1)
        : currentWord.substring(0, text.length + 1);

      setText(updatedText);

      if (!isDeleting && updatedText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % dynamicWords.length);
      }
    };

    const typingSpeed = isDeleting ? 100 : 150;
    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex]);

  return (
    <section id="hero" className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="md:w-3/5 text-center md:text-left">
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4">
          Building Digital <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-teal-400 min-h-[6rem] md:min-h-[7rem] inline-block">
            {text || '\u00A0'}
          </span>
          <span className="animate-cursor-blink text-sky-400 text-5xl md:text-6xl align-middle">|</span>
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto md:mx-0">
          I'm a passionate developer specializing in creating modern, responsive, and user-friendly web applications. Let's turn your ideas into reality.
        </p>
        <div className="flex justify-center md:justify-start space-x-4">
          <a href="#projects" className="bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-sky-500/40 shadow-sky-500/20 transform hover:-translate-y-1">
            View My Work
          </a>
          <a href="#contact" className="bg-slate-700 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-600 transition-all duration-300 transform hover:-translate-y-1">
            Get In Touch
          </a>
        </div>
      </div>
      <div className="md:w-2/5 flex justify-center">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 to-teal-400 opacity-75 blur group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse hexagon"></div>
          <div className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden shadow-2xl shadow-sky-500/20 bg-slate-900 hexagon">
              <img 
                src="../assets/NanoBananaProfilePic.jpeg" 
                alt="Developer Portrait" 
                className="w-full h-full object-cover"
              />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;