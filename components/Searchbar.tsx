"use client"
import { scrapeAndStoreProduct } from '@/lib/actions';
import React, { useState,FormEvent } from 'react'

const isValidAmazonLink=(url:string)=>{
try {
  const parsedURL =new URL(url);
const hostName=parsedURL.hostname;

if(hostName.includes('amazon.com')||
hostName.endsWith('amazon')||
hostName.includes('amazon.'))
return true;

} catch (error) {
  return false;
}
}

const Searchbar = () => {
  const [searchLink,setSearchLink]=useState('');
  const [isLoading,setIsLoading]=useState(false);

    const handleSubmit=async (event: FormEvent<HTMLFormElement>)=>{
event.preventDefault();
console.log('Form submitted:', searchLink);

//checking for is the link from amazon
const isValidLink=isValidAmazonLink(searchLink);
console.log('validLink');
if(!isValidLink) return alert('plz provide valid  Amazon Link')

  try {
    setIsLoading(true);
//scraping of Data

const product= await scrapeAndStoreProduct(searchLink);

  } catch (error) {
    console.log(error);
  }
  finally{
    setIsLoading(false);
  }
    }

  return (
   <form className='flex flex-wrap gap-4 mt-12' 
   onSubmit={handleSubmit}>

<input type="text"
 placeholder='Enter product link' 
 className="searchbar-input"
 value={searchLink}
 onChange={(e) => {
  setSearchLink(e.target.value); // Updates the state with the new input value
}}
 />
<button type='submit' 
className='searchbar-btn' 
disabled={searchLink===''}
>
{isLoading ?'Searching...':'Search'}
</button>
   </form>
  )
}

export default Searchbar