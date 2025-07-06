'use client'
import React from 'react'
import UserLayout from '../auth/user/UserLayout'
import InquiriesList from './InquiriesList'

export default function InquiriesPage() {
  return (
    <UserLayout>
      <InquiriesList />
    </UserLayout>
  )
}