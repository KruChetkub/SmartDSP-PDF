// SPDX-License-Identifier: AGPL-3.0-or-later

import { useRef, type ChangeEvent } from 'react';

export const useRibbonFileInputs = (
  onOpenFile: (file: File) => void,
  onAddImage: (file: File) => void,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) onOpenFile(selectedFile);
    event.target.value = '';
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) onAddImage(selectedFile);
    event.target.value = '';
  };

  return {
    fileInputRef,
    imageInputRef,
    handleFileInputChange,
    handleImageInputChange,
  };
};
