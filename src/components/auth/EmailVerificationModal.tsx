"use client";

import EmailVerification from './EmailVerification';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EmailVerificationModal({
  isOpen,
  onClose,
  onSuccess
}: EmailVerificationModalProps) {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="email-verification-modal" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <EmailVerification onSuccess={handleSuccess} onClose={onClose} />
      </div>
    </div>
  );
}
