import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function FooterCom() {
  return (
    <footer className="bg-black effect-hover h-[4.7vh] min-h-[36px] text-gray-400 text-xs py-2 px-4 flex justify-between items-center border-t border-gray-900">
      <div>
        {new Date().getFullYear()} © ZKBD
      </div>
      <div className="flex space-x-4 items-center">
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          <FaTwitter size={18} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          <FaGithub size={18} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          <FaLinkedin size={18} />
        </a>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 text-sm">
        Created by Nullity
      </div>
    </footer>
  );
}
