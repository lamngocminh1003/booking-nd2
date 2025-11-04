import { useState } from "react";

interface GoogleDocsEmbedProps {
  docId: string;
  title?: string;
  className?: string;
}

const GoogleDocsEmbed = ({
  docId,
  title = "Google Document",
  className = "",
}: GoogleDocsEmbedProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <iframe
        src={`https://docs.google.com/document/d/${docId}/preview`}
        className="w-full h-96 sm:h-[600px] border-0 rounded-lg"
        title={title}
        onLoad={() => setLoading(false)}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default GoogleDocsEmbed;
