import React from 'react';

interface DisclaimerModalProps {
  onAcknowledge: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAcknowledge }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
      <h2 className="text-xl font-bold mb-4 text-white">Disclaimer &amp; Indemnity</h2>
      <p className="mb-4 text-white">
        This build is provided free of charge as a tool to help businesses and departments become API ready.
        It is not to be sold, redistributed, or used for commercial resale.<br /><br />
        By clicking "OK", you acknowledge that you understand and accept these terms, and agree to use this tool at your own risk.
        The creators accept no liability for any misuse or damages arising from its use.
      </p>
      <div className="mb-4 text-white text-sm">
        Contact: <a href="mailto:flavius@narokobi.tech" className="underline">flavius@narokobi.tech</a><br />
        Phone: +675 8220 8603
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={onAcknowledge}
        autoFocus
      >
        OK
      </button>
    </div>
  </div>
);

export default DisclaimerModal;
