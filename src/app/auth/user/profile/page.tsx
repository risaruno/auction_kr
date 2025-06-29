"use client";
import * as React from 'react';
import UserLayout from '../UserLayout';
import UserInfo from '../info/UserInfo';

export default function UserProfilePage() {
  return (
    <UserLayout>
      <UserInfo />
    </UserLayout>
  );
}
