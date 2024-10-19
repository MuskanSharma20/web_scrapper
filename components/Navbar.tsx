import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const navIcons=[
  {src:'/assets/icons/search.svg',alt:'search'},
  {src:'/assets/icons/black-heart.svg',alt:'heart'},
  {src:'/assets/icons/user.svg',alt:'user'},
]

function Navbar() {
  return (
   <header className='w-full'>
    <nav className='nav'>
<Link href='/' className='flex items-center gap-1'>
  <Image
src='/assets/icons/logo.svg'
  width={27}
  height={27}  
  alt='Logo'
  />
 <p className='nav-logo'>
  <span className='text-primary'>Scrapezon</span>
 </p>
</Link>
<div className="flex items-center gap-5">
  {navIcons.map((icon)=>(  // doing this mapping bcz otherwise have to make three imgs component
    <Image key={icon.alt}
    src={icon.src}
alt={icon.alt}
width={28}
height={28}
className='object-contain'
/>
  ))}
</div>
    </nav>
   </header>
  )
}

export default Navbar