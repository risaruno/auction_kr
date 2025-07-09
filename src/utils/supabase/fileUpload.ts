'use server'

import { createClient } from './server'

export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload expert profile image to Supabase Storage
 */
export async function uploadExpertProfileImage(
  expertId: string, 
  file: File
): Promise<FileUploadResult> {
  try {
    const supabase = await createClient()
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '지원하지 않는 파일 형식입니다. JPG, PNG, GIF 파일만 업로드 가능합니다.'
      }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.'
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${expertId}-${Date.now()}.${fileExt}`
    const filePath = `experts/profiles/${fileName}`

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('expert-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: '파일 업로드 중 오류가 발생했습니다.'
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('expert-files')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.'
    }
  }
}

/**
 * Upload electronic identity verification document to Supabase Storage
 */
export async function uploadElectronicIdentityDocument(
  applicationId: string,
  file: File
): Promise<FileUploadResult> {
  try {
    const supabase = await createClient()
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, JPG, PNG 파일만 업로드 가능합니다.'
      }
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.'
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${applicationId}-identity-${Date.now()}.${fileExt}`
    const filePath = `applications/identity-docs/${fileName}`

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('application-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: '파일 업로드 중 오류가 발생했습니다.'
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath)

    // Update bidding application with document info
    const { error: updateError } = await supabase
      .from('bidding_applications')
      .update({
        electronic_identity_document_url: publicUrl,
        electronic_identity_document_name: file.name,
        electronic_identity_document_uploaded_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return {
        success: false,
        error: '문서 정보 저장 중 오류가 발생했습니다.'
      }
    }

    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.'
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<FileUploadResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: '파일 삭제 중 오류가 발생했습니다.'
      }
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: '파일 삭제 중 오류가 발생했습니다.'
    }
  }
}
