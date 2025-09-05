// app/search/page.jsx
import { Suspense } from 'react';
import SearchClient from './searchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading search results...</div>}>
      <SearchClient/>
    </Suspense>
  );
} 
