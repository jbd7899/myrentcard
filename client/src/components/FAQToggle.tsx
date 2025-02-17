import { useEffect } from 'react';

export function initializeFAQToggle() {
  const faqItems = document.querySelectorAll('.faq-question');
  
  faqItems.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      item?.classList.toggle('active');
    });
  });
}

export function FAQInitializer() {
  useEffect(() => {
    initializeFAQToggle();
  }, []);

  return null;
}
