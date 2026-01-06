import React from 'react';
import { MessageCircle, Send, Instagram } from 'lucide-react';

const ContactButtons = ({ vertical = false }) => {
  const contacts = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/41765288403',
      className: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: Send,
      href: 'https://t.me/Hoohlya',
      className: 'telegram'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://www.instagram.com/hoohlyashop',
      className: 'instagram'
    }
  ];

  return (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row flex-wrap'} gap-3`} data-testid="contact-buttons">
      {contacts.map((contact) => (
        <a
          key={contact.name}
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`contact-btn ${contact.className}`}
          data-testid={`contact-${contact.className}`}
        >
          <contact.icon size={18} strokeWidth={1.5} />
          <span>{contact.name}</span>
        </a>
      ))}
    </div>
  );
};

export default ContactButtons;
