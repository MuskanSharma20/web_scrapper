import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractPrice } from '../utils';

export async function scrapeAmazonProduct(url:string) {
    
    if(!url) return;
    
    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_69abf56f-zone-pricewise:o84twu9nkv9p -k "http://lumtest.com/myip.json"

 const userName=String(process.env.BRIGHTDATA_USERNAME);
 const password=String(process.env.BRIGHTDATA_PASSWORD);
 const port =22225;
 const sessionId = (1000000 * Math.random()) | 0;

 const options ={
    auth:{
        username:`${userName}-session-${sessionId}`,
        password,
    },
    host:`brd.superproxy.io`,         
    port,
    rejectUnauthorized:false,
 }

 try {
    //fetching product page
    const response = await axios.get(url,options);
   const $ =cheerio.load(response.data);
   const title=$('#productTitle').text().trim();
   const currentPrice=extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
     
   );

   const originalPrice=extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
   );
   console.log({title});
        console.log(currentPrice);
        console.log(originalPrice);

 } catch (error:any) {
    throw new Error(`Failed to scrape product:${error.message}`)
 }

}