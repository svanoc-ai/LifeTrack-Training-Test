import type {ReactNode} from 'react';
export function NavIcon({name}:{name:'layers'|'calendar'|'back'|'next'|'today'|'plus'|'calendar-next'}):ReactNode{
 const paths={layers:<><rect x="4" y="4" width="16" height="5" rx="1"/><rect x="4" y="11" width="16" height="9" rx="1"/></>,calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,back:<path d="m15 18-6-6 6-6"/>,next:<path d="m9 18 6-6-6-6"/>,today:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18m-9 5 2 2 4-4"/></>,plus:<path d="M12 5v14M5 12h14"/>,'calendar-next':<><rect x="2.5" y="4.5" width="14" height="15" rx="2"/><path d="M6 2.5v4M13 2.5v4M2.5 9h14M10 15h11m-4-4 4 4-4 4"/></>};
 return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
