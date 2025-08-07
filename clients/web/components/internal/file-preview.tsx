import { Plus, PlusSquare, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function FilesPreview({ files, discardFiles, openFileDialog }: {
  files: File[],
  discardFiles: () => void
  openFileDialog: () => void
}) {
  const [showAll, setShowAll] = useState(false);
  const [gridConfig, setGridConfig] = useState({ columns: 4, maxVisible: 7 });

  // Responsive grid configuration
  const getGridConfig = () => {
    if (typeof window === 'undefined') return { columns: 4, maxVisible: 7 };

    const width = window.innerWidth;
    let columns: number;

    if (width < 640) {
      columns = 1; // sm: 1 column
    } else if (width < 1024) {
      columns = 2; // md: 2 columns  
    } else if (width < 1280) {
      columns = 3; // lg: 3 columns
    } else {
      columns = 4; // xl: 4 columns
    }

    // Calculate optimal number of files to show before "show more"
    // We want to fill complete rows and leave space for "show more" card if needed
    const getMaxVisibleFiles = (totalFiles: number, cols: number) => {
      if (totalFiles <= cols) {
        return totalFiles; // Show all if they fit in one row
      }

      // For multiple rows, we want to optimize space usage
      const firstRowSlots = cols;
      const remainingFiles = totalFiles - firstRowSlots;

      if (remainingFiles <= 0) {
        return totalFiles;
      }

      // If remaining files can fit in the next row with the "show more" card
      if (remainingFiles <= cols - 1) {
        return totalFiles; // Show all files since they fit efficiently
      }

      // Otherwise, show first row and "show more" card
      return firstRowSlots;
    };

    const maxVisible = getMaxVisibleFiles(files.length, columns);

    return { columns, maxVisible };
  };

  // Update grid configuration on window resize
  useEffect(() => {
    const updateGridConfig = () => {
      setGridConfig(getGridConfig());
    };

    updateGridConfig();
    window.addEventListener('resize', updateGridConfig);
    return () => window.removeEventListener('resize', updateGridConfig);
  }, [files.length]);

  // Smart file visibility logic
  const getVisibleFiles = () => {
    if (showAll) {
      return {
        files: files,
        shouldShowMoreCard: false,
        hiddenCount: 0
      };
    }

    const { maxVisible } = gridConfig;

    if (files.length <= maxVisible) {
      return {
        files: files,
        shouldShowMoreCard: false,
        hiddenCount: 0
      };
    }

    // Check if showing "more" card is efficient
    const hiddenCount = files.length - maxVisible;
    const availableSlotsInNextRow = gridConfig.columns - (maxVisible % gridConfig.columns);

    // If hidden files can fit in available slots of the current layout, show them
    if (hiddenCount <= availableSlotsInNextRow && maxVisible % gridConfig.columns !== 0) {
      return {
        files: files,
        shouldShowMoreCard: false,
        hiddenCount: 0
      };
    }

    return {
      files: files.slice(0, maxVisible),
      shouldShowMoreCard: true,
      hiddenCount: hiddenCount
    };
  };

  const handleRemoveFile = (indexToRemove: number) => {
    // This function would need to communicate with the parent component
    console.log('Remove file at index:', indexToRemove);
  };

  const getFilePreview = (file: File) => {
    const fileType = file.type.split('/')[0];

    if (fileType === 'image') {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      );
    } else if (fileType === 'video') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
            <span className="text-xs text-white/70 font-medium">VIDEO</span>
          </div>
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"
                fill="currentColor"
              />
              <path
                d="M16 10V8c0-.55-.45-1-1-1h-2v6h2c.55 0 1-.45 1-1v-2zm-2-1h1v4h-1V9z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs text-red-600 font-medium">PDF</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs text-gray-600 font-medium">
              {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
            </span>
          </div>
        </div>
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get responsive grid class
  const getGridClass = () => {
    const { columns } = gridConfig;
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <svg className="w-12 h-12 text-muted-foreground mx-auto mb-2" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          <p className="text-muted-foreground">No files attached</p>
        </div>
      </div>
    );
  }

  const { files: visibleFiles, shouldShowMoreCard, hiddenCount } = getVisibleFiles();

  return (
    <div className="flex-1 overflow-y-auto bg-background border-t border-border">
      {/* Header with discard button */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between gap-4 z-10">
        {/* Left: Attachments Title and Count */}
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-base lg:text-lg font-semibold truncate">
            Attachments
          </h3>
          <span className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
            {files.length}
          </span>
        </div>

        {/* Center: Info/Prompt */}
        <span className="flex items-center text-muted-foreground text-sm select-none whitespace-nowrap gap-1">
          Drag to add more
          <span aria-hidden="true" className="font-semibold opacity-40 px-1">·</span>
          or use
        </span>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={openFileDialog}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 cursor-pointer"
            type="button"
          >
            <PlusSquare className="text-blue-700" size={18} />
            <span>Add Files</span>
          </button>
          <button
            onClick={discardFiles}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 cursor-pointe"
            type="button"
          >
            <Trash2 className="text-red-500" size={18} />
            <span>Discard All</span>
          </button>
        </div>
      </div>



      {/* Files grid */}
      <div className="p-4">
        <div className={`grid ${getGridClass()} gap-4`}>
          {visibleFiles.map((file, index) => (
            <div key={index} className="group relative">
              <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                {/* File preview */}
                <div className="aspect-square relative">
                  {getFilePreview(file)}

                  {/* Remove button overlay */}
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* File info */}
                <div className="p-3 bg-card">
                  <div className="text-sm font-medium text-foreground truncate mb-1" title={file.name}>
                    {file.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show more card - only when it makes sense */}
          {shouldShowMoreCard && (
            <div
              className="bg-muted/50 hover:bg-muted border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group aspect-square"
              onClick={() => setShowAll(true)}
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">
                  +{hiddenCount} more
                </span>
                <span className="text-xs text-muted-foreground block mt-1">
                  Click to view all
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Show less button */}
        {showAll && files.length > gridConfig.maxVisible && (
          <div className="flex justify-center mt-6">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              onClick={() => setShowAll(false)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 15l-6-6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Show less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}