import { useState, useRef } from "react";
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner@2.0.3";
import { uploadAPI } from "../utils/api";
import { getAuthToken } from "../utils/api";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  content?: string;
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
  error?: string;
}

export function UploadStudio() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'healthy' | 'degraded' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processAndGenerateCards = async (file: File, filePath: string): Promise<any> => {
    try {
      // Check if user is authenticated
      const token = getAuthToken();
      if (!token) {
        throw new Error('Please log in to generate flashcards');
      }

      // Generate deck title from file name
      const deckTitle = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      
      // Call backend to generate flashcards using the API utility
      const data = await uploadAPI.generateFlashcards(
        filePath,
        file.type,
        file.name,
        deckTitle
      );
      
      console.log('Flashcard generation response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      return data;
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File) => {
    console.log('=== FRONTEND: Starting file upload ===');
    console.log('File:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    const fileId = Math.random().toString(36).substr(2, 9);
    
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => {
      const updated = [...prev, newFile];
      console.log('Added file to list, total files:', updated.length);
      return updated;
    });
    toast.success(`Started uploading ${file.name}`);

    try {
      // Check authentication
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        throw new Error('Please log in to upload files');
      }
      console.log('Auth token present');

      // Update progress
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 20 } : f)
      );

      // Upload file to backend
      console.log('Uploading file to backend...');
      
      let uploadResult;
      try {
        uploadResult = await uploadAPI.uploadFile(file);
        console.log('Upload result:', uploadResult);
      } catch (uploadError: any) {
        console.error('Upload API error:', uploadError);
        
        // Check for specific error types
        const errorMsg = uploadError.message || '';
        
        if (errorMsg.includes('credentials') || errorMsg.includes('Credentials')) {
          throw new Error('Storage service is temporarily unavailable. The system will use a fallback method - please try again.');
        } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (errorMsg.includes('token') || errorMsg.includes('Unauthorized')) {
          throw new Error('Session expired. Please log out and log back in.');
        }
        
        throw new Error(errorMsg || 'Failed to upload file to server');
      }

      if (!uploadResult.success) {
        const errorMsg = uploadResult.error || uploadResult.details || 'File upload failed';
        throw new Error(errorMsg);
      }
      
      // Show info if using fallback storage
      if (uploadResult.file.usedFallback) {
        console.log('Using temporary storage fallback');
        toast.info('File uploaded using temporary storage. Processing will continue normally.', {
          duration: 3000,
        });
      }
      
      console.log('File uploaded successfully to path:', uploadResult.file.path);

      // Update progress
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 60 } : f)
      );

      // Update status to processing
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, status: 'processing', progress: 70 } : f)
      );
      
      toast.info(`Processing ${file.name} and generating flashcards...`);

      // Generate flashcards from uploaded file
      console.log('Calling flashcard generation...');
      const generationResult = await processAndGenerateCards(
        file,
        uploadResult.file.path
      );
      
      console.log('Generation result:', generationResult);
      console.log('Number of cards generated:', generationResult.cards?.length || 0);

      // Update progress
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { ...f, progress: 90 } : f)
      );

      // Convert backend cards to frontend format
      if (!generationResult.cards || generationResult.cards.length === 0) {
        throw new Error('No flashcards were generated from the file');
      }
      
      const flashcards = generationResult.cards.map((card: any) => {
        console.log('Card:', card.front?.substring(0, 50) + '...');
        return {
          question: card.front,
          answer: card.back
        };
      });
      
      console.log('Converted to frontend format:', flashcards.length, 'flashcards');

      // Update with completed status
      setUploadedFiles(prev => {
        const updated = prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          content: generationResult.extracted_content || 'Content extracted successfully',
          flashcards 
        } : f);
        console.log('Updated file status to completed');
        return updated;
      });

      toast.success(`Successfully processed ${file.name} and generated ${flashcards.length} flashcards! Deck "${generationResult.deck?.title}" created.`);
      console.log('=== FRONTEND: Upload complete ===');

    } catch (error) {
      console.error('=== FRONTEND: Upload error ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      setUploadedFiles(prev => 
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : 'Processing failed' 
        } : f)
      );
      toast.error(error instanceof Error ? error.message : `Failed to process ${file.name}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        if (validateFile(file)) {
          uploadFile(file);
        }
      });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        if (validateFile(file)) {
          uploadFile(file);
        }
      });
    }
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (file.size > maxSize) {
      toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported.`);
      return false;
    }

    return true;
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-light-cta mb-2">Upload Studio</h1>
          <p className="text-sm md:text-base text-gray-600">Transform your study materials into AI-powered flashcards</p>
        </div>

        {/* Upload Area */}
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-200 p-6 md:p-12 text-center hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-blue-100/30 transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/50 hover:scale-[1.02] group cursor-pointer light-shadow">
          <div
            className={`relative transition-all duration-300 ${dragActive ? 'opacity-70 scale-105' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {/* Upload Icon */}
            <div className="mb-4 md:mb-6">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-blue-200/50">
                <Upload className="w-8 md:w-10 h-8 md:h-10 text-blue-600 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-110" />
              </div>
            </div>

            {/* Upload Text */}
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Upload Study Material</h3>
              <p className="text-sm md:text-base text-gray-600 mb-4">Drag your files here or click to browse</p>
              <p className="text-xs md:text-sm text-gray-500">Supports PDF, images, text files and Word documents</p>
            </div>

            {/* Browse Button */}
            <Button
              onClick={handleFileSelect}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 group-hover:animate-pulse"
            >
              Browse Files
            </Button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Supported File Types */}
        <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-50 to-red-50/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-100/50 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100/50 group cursor-pointer light-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FileText className="w-5 h-5 text-red-600 transition-colors duration-300 group-hover:text-red-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900 transition-colors duration-300 group-hover:text-red-700">PDF</p>
              <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-red-500">Documents</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-50 to-green-50/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-100/50 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/50 group cursor-pointer light-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Image className="w-5 h-5 text-green-600 transition-colors duration-300 group-hover:text-green-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900 transition-colors duration-300 group-hover:text-green-700">Images</p>
              <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-green-500">JPG, PNG</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-100/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 group cursor-pointer light-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <File className="w-5 h-5 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-700">Text</p>
              <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-blue-500">TXT files</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-100/50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/50 group cursor-pointer light-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FileText className="w-5 h-5 text-purple-600 transition-colors duration-300 group-hover:text-purple-700" />
            </div>
            <div>
              <p className="font-medium text-gray-900 transition-colors duration-300 group-hover:text-purple-700">Word</p>
              <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-purple-500">DOC, DOCX</p>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 md:mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-xl p-4 light-shadow hover:light-shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {file.type.includes('pdf') && <FileText className="w-5 h-5 text-red-600" />}
                        {file.type.includes('image') && <Image className="w-5 h-5 text-green-600" />}
                        {file.type.includes('text') && <File className="w-5 h-5 text-blue-600" />}
                        {(file.type.includes('document') || file.type.includes('word')) && <FileText className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm text-gray-600 capitalize">{file.status}</span>
                      {file.status !== 'uploading' && file.status !== 'processing' && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="mb-3">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {file.status === 'uploading' ? 'Uploading...' : 'Processing content...'}
                      </p>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 mb-2">{file.error}</p>
                      <Button
                        onClick={() => {
                          removeFile(file.id);
                          toast.info('File removed. Please try uploading again.');
                        }}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Remove & Try Again
                      </Button>
                    </div>
                  )}

                  {file.status === 'completed' && file.flashcards && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 font-medium mb-2">
                        ✅ Successfully generated {file.flashcards.length} flashcards
                      </p>
                      <div className="space-y-2">
                        {file.flashcards.slice(0, 2).map((card, index) => (
                          <div key={index} className="bg-white border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">Q: {card.question}</p>
                            <p className="text-sm text-gray-600">A: {card.answer}</p>
                          </div>
                        ))}
                        {file.flashcards.length > 2 && (
                          <p className="text-xs text-green-600">+ {file.flashcards.length - 2} more flashcards</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200 light-shadow">
          <h3 className="font-semibold text-blue-900 mb-3">Tips for better flashcards:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Use clear, well-structured documents for best results</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Include key concepts, definitions, and examples</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Images with text will be processed using OCR technology</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Maximum file size: 10MB per file</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}