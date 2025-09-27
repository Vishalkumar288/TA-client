import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'error';
  text: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, text }) => {
  const color = type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
  return (
    <div className={`${color} px-4 py-2 rounded-md mb-3`}>
      {text}
    </div>
  );
};

export default AlertMessage;
