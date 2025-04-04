
import { useEffect, useState } from 'react';
import { Button } from './button';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    
    const toggleVisibility = () => {
      if (!footer) return;
      const footerRect = footer.getBoundingClientRect();
      setIsVisible(footerRect.top <= window.innerHeight);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700 shadow-lg"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  ) : null;
}
