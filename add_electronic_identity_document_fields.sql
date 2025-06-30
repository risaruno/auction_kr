-- Add electronic identity verification document fields to bidding_applications table

ALTER TABLE bidding_applications 
ADD COLUMN IF NOT EXISTS electronic_identity_document_url TEXT,
ADD COLUMN IF NOT EXISTS electronic_identity_document_name TEXT,
ADD COLUMN IF NOT EXISTS electronic_identity_document_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN bidding_applications.electronic_identity_document_url IS 'URL to the uploaded electronic identity verification document';
COMMENT ON COLUMN bidding_applications.electronic_identity_document_name IS 'Original name of the uploaded electronic identity verification document';
COMMENT ON COLUMN bidding_applications.electronic_identity_document_uploaded_at IS 'Timestamp when the electronic identity verification document was uploaded';
