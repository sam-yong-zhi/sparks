"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"

export default function DeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-8">
          This app is private. Your GitHub account doesn&apos;t have permission to access it.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Sign out
        </button>
        <Link
          href="/auth/signin"
          className="block mt-3 text-sm text-gray-400 hover:text-gray-600"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
